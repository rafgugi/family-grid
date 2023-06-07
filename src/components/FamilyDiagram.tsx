import { Person, PersonNode } from '../family.interface';
import { treesToPersonNode } from '../family.util';
import { useRef, useEffect, useMemo } from 'react';
import * as go from 'gojs';
import GenogramLayout from '../GenogramLayout';

interface FamilyDiagramProps {
  trees: Person[];
  depth?: number;
}

function FamilyDiagram(props: FamilyDiagramProps) {
  const { trees, depth } = props;
  const divRef = useRef<HTMLDivElement>(null);

  /**
   * Setup the diagram based on the given props, then create a svg
   * from it and append to the div element.
   */
  const svg = useMemo(() => {
    const personNodes = treesToPersonNode(trees, depth || 0)
    const diagram = DiagramUtil.initDiagram();
    DiagramUtil.setupDiagram(diagram, personNodes);

    // We need to host the diagram into a temprary element so it can be rendered
    const tempDiv = document.createElement('div');
    diagram.div = tempDiv;

    // Create svg from the diagram, then finally delete the div
    const svg = diagram.makeSvg({ scale: 1 });
    tempDiv.remove();
    return svg;
  }, [trees, depth])

  useEffect(() => {
    if (svg) {
      svg.setAttribute('class', 'my-3 m-auto img-fluid');
      divRef.current?.replaceChildren(svg);
      return () => svg.remove();
    }
  }, [svg]);

  return <div ref={divRef} />;
}

class DiagramUtil {
  /**
   * Diagram initialization method, which is passed to the ReactDiagram component.
   * This method is responsible for making the diagram and initializing the model,
   * any templates, and maybe doing other initialization tasks like customizing tools.
   * The model's data should not be set here, as the ReactDiagram component
   * handles that via the other props.
   */
  static initDiagram(): go.Diagram {
    const $ = go.GraphObject.make;

    const myDiagram = $(go.Diagram, {
      'animationManager.isEnabled': false,
      initialAutoScale: go.Diagram.Uniform,
      layout: $(GenogramLayout, {
        direction: 90,
        layerSpacing: 30,
        columnSpacing: 10,
      }),
    });

    // determine the color for each attribute shape
    function attrFill(a: String) {
      if (a === 'S') return '#d4071c'; // red
      return 'transparent';
    }

    // determine the geometry for each attribute shape;
    const none = go.Geometry.parse('');
    const slash = go.Geometry.parse('F M38 0 L40 0 40 2 2 40 0 40 0 38z');
    function attrShape(a: String) {
      if (a === 'S') return slash;
      return none;
    }

    // two different node templates, one for each sex,
    // named by the category value in the node data object
    myDiagram.nodeTemplateMap.add('M', // male
      $(go.Node, 'Vertical',
        {
          locationSpot: go.Spot.Center,
          locationObjectName: 'ICON',
          selectionObjectName: 'ICON',
        },
        new go.Binding('opacity', 'hide', h => (h ? 0 : 1)),
        new go.Binding('pickable', 'hide', h => !h),
        $(go.Panel,
          { name: 'ICON' },
          $(go.Shape, 'Square', {
            width: 40,
            height: 40,
            strokeWidth: 2,
            fill: 'white',
            stroke: '#919191',
            portId: '',
          }),
          $(go.Panel,
            {
              itemTemplate: $(go.Panel,
                $(go.Shape,
                  { stroke: null, strokeWidth: 0 },
                  new go.Binding('fill', '', attrFill),
                  new go.Binding('geometry', '', attrShape)
                )
              ),
              margin: 1,
            },
            new go.Binding('itemArray', 'attributes')
          )
        ),
        $(go.TextBlock,
          {
            textAlign: 'center',
            maxSize: new go.Size(80, NaN),
            background: 'rgba(255,255,255,0.5)',
          },
          new go.Binding('text', 'name')
        )
      )
    );

    myDiagram.nodeTemplateMap.add('F', // female
      $(go.Node,
        'Vertical',
        {
          locationSpot: go.Spot.Center,
          locationObjectName: 'ICON',
          selectionObjectName: 'ICON',
        },
        new go.Binding('opacity', 'hide', h => (h ? 0 : 1)),
        new go.Binding('pickable', 'hide', h => !h),
        $(go.Panel,
          { name: 'ICON' },
          $(go.Shape, 'Circle', {
            width: 40,
            height: 40,
            strokeWidth: 2,
            fill: 'white',
            stroke: '#a1a1a1',
            portId: '',
          }),
          $(go.Panel,
            {
              itemTemplate: $(go.Panel,
                $(go.Shape,
                  { stroke: null, strokeWidth: 0 },
                  new go.Binding('fill', '', attrFill),
                  new go.Binding('geometry', '', attrShape)
                )
              ),
              margin: 1,
            },
            new go.Binding('itemArray', 'attributes')
          )
        ),
        $(go.TextBlock,
          {
            textAlign: 'center',
            maxSize: new go.Size(80, NaN),
            background: 'rgba(255,255,255,0.5)',
          },
          new go.Binding('text', 'name')
        )
      )
    );

    // the representation of each label node -- nothing shows on a Marriage Link
    myDiagram.nodeTemplateMap.add('LinkLabel',
      $(go.Node, {
        selectable: false,
        width: 1,
        height: 1,
        fromEndSegmentLength: 20,
      })
    );

    myDiagram.linkTemplate = // for parent-child relationships
      $(go.Link,
        {
          routing: go.Link.Orthogonal,
          corner: 10,
          curviness: 15,
          layerName: 'Background',
          selectable: false,
        },
        $(go.Shape, { stroke: 'gray', strokeWidth: 2 })
      );

    myDiagram.linkTemplateMap.add(
      'Marriage', // for marriage relationships
      $(go.Link,
        // AvoidsNodes routing might be better when people have multiple marriages
        {
          routing: go.Link.AvoidsNodes,
          corner: 10,
          fromSpot: go.Spot.LeftRightSides,
          toSpot: go.Spot.LeftRightSides,
          selectable: false,
          isTreeLink: false,
          layerName: 'Background',
        },
        $(go.Shape, { strokeWidth: 2.5, stroke: '#5d8cc1' /* blue */ })
      )
    );

    return myDiagram;
  }

  /**
   * create and initialize the Diagram.model given an array of node
   * data representing people
   */
  static setupDiagram(diagram: go.Diagram, nodeDataArray: PersonNode[]) {
    diagram.model = new go.GraphLinksModel({
      // declare support for link label nodes
      linkLabelKeysProperty: 'labelKeys',
      // this property determines which template is used
      nodeCategoryProperty: 's',
      // if a node data object is copied, copy its data.attributes Array
      copiesArrays: true,
      nodeDataArray: nodeDataArray,
    });
    this.setupMarriages(diagram);
    this.setupParents(diagram);
  }

  /**
   * now process the node data to determine marriages
   */
  static setupMarriages(diagram: go.Diagram) {
    const model: go.GraphLinksModel = diagram.model as go.GraphLinksModel;
    const nodeDataArray = model.nodeDataArray;
    for (let i = 0; i < nodeDataArray.length; i++) {
      const data = nodeDataArray[i];
      const key = data.key;
      let spouses = data.spouses;
      if (spouses) {
        for (let j = 0; j < spouses.length; j++) {
          const spouse = spouses[j];
          const person = model.findNodeDataForKey(spouse);
          if (key === spouse || !person) {
            console.log('cannot create Marriage with self or unknown person ' + spouse);
            continue;
          }
          const link = this.findMarriage(diagram, key, spouse);
          if (link === null) {
            // add a label node for the marriage link
            const mlab = { s: 'LinkLabel', key: undefined };
            model.addNodeData(mlab);
            // add the marriage link itself, also referring to the label node
            const mdata = {
              from: key,
              to: spouse,
              labelKeys: [mlab.key],
              category: 'Marriage',
            };
            model.addLinkData(mdata);
          }
        }
      }
    }
  }

  /**
   * process parent-child relationships once all marriages are known
   */
  static setupParents(diagram: go.Diagram) {
    const model: go.GraphLinksModel = diagram.model as go.GraphLinksModel;
    const nodeDataArray = model.nodeDataArray;
    for (let i = 0; i < nodeDataArray.length; i++) {
      const data = nodeDataArray[i];
      const key = data.key;
      const mother = data.mother;
      const father = data.father;
      if (mother !== undefined && father !== undefined) {
        const link = this.findMarriage(diagram, mother, father);
        if (link === null) {
          // or warn no known mother or no known father or no known marriage between them
          console.log('unknown marriage: ' + mother + ' & ' + father);
          continue;
        }
        const mdata = link.data;
        if (mdata.labelKeys === undefined || mdata.labelKeys[0] === undefined) continue;

        const mlabkey = mdata.labelKeys[0];
        const cdata = { from: mlabkey, to: key };
        model.addLinkData(cdata);
      }
    }
  }

  /**
   * find marriage link between node keys a and b
   */
  static findMarriage(diagram: go.Diagram, a: string, b: string) {
    const nodeA = diagram.findNodeForKey(a);
    const nodeB = diagram.findNodeForKey(b);
    if (nodeA !== null && nodeB !== null) {
      const it = nodeA.findLinksBetween(nodeB); // in either direction
      while (it.next()) {
        const link = it.value;
        // Link.data.category === 'Marriage' means it's a marriage relationship
        if (link.data !== null && link.data.category === 'Marriage')
          return link;
      }
    }
    return null;
  }
}

export default FamilyDiagram;
