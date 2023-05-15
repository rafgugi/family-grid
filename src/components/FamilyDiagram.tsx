import { Person } from '../family.interface';
import { treesToPersonNode } from '../family.util';
import { Component, RefObject, createRef } from 'react';
import * as go from 'gojs';
import { ReactDiagram } from 'gojs-react';
import GenogramLayout from '../GenogramLayout';

interface FamilyDiagramProps {
  trees: Person[];
  depth?: number;
}

class FamilyDiagram extends Component<FamilyDiagramProps, {}> {
  /**
   * Ref to keep a reference to the component, which provides access to the GoJS diagram via getDiagram().
   */
  private diagramRef: RefObject<ReactDiagram>;

  constructor(props: FamilyDiagramProps) {
    super(props);
    this.diagramRef = createRef();
  }

  /**
   * Get the diagram reference and add any desired diagram listeners.
   * Typically the same function will be used for each listener,
   * with the function using a switch statement to handle the events.
   * This is only necessary when you want to define additional app-specific diagram listeners.
   */
  public componentDidMount() {
    if (!this.diagramRef.current) return;
    const diagram = this.diagramRef.current.getDiagram();
    if (diagram instanceof go.Diagram) {
      this.setupDiagram(diagram);
    }
  }

  /**
   * Diagram initialization method, which is passed to the ReactDiagram component.
   * This method is responsible for making the diagram and initializing the model, any templates,
   * and maybe doing other initialization tasks like customizing tools.
   * The model's data should not be set here, as the ReactDiagram component handles that via the other props.
   */
  private initDiagram(): go.Diagram {
    // set your license key here before creating the diagram: go.Diagram.licenseKey = "...";
    const $ = go.GraphObject.make;

    const myDiagram =
      $(go.Diagram,
        {
          "animationManager.isEnabled": false,
          initialAutoScale: go.Diagram.Uniform,
          "undoManager.isEnabled": true,
          maxSelectionCount: 1,
          // when a node is selected, draw a big yellow circle behind it
          nodeSelectionAdornmentTemplate:
            $(go.Adornment, "Auto",
              { layerName: "Grid" },  // the predefined layer that is behind everything else
              $(go.Shape, "Circle", { fill: "#c1cee3", stroke: null }),
              $(go.Placeholder, { margin: 2 })
            ),
          layout: $(GenogramLayout, { direction: 90, layerSpacing: 30, columnSpacing: 10 })
        });

    // determine the color for each attribute shape
    function attrFill(a: String) {
      if (a === 'S') return "#d4071c"; // red
      return "transparent";
    }

    // determine the geometry for each attribute shape;
    const none = go.Geometry.parse("");
    const slash = go.Geometry.parse("F M38 0 L40 0 40 2 2 40 0 40 0 38z");
    function attrShape(a: String) {
      if (a === 'S') return slash;
      return none;
    }

    // two different node templates, one for each sex,
    // named by the category value in the node data object
    myDiagram.nodeTemplateMap.add("M",  // male
      $(go.Node, "Vertical",
        { locationSpot: go.Spot.Center, locationObjectName: "ICON",
          selectionObjectName: "ICON" },
        new go.Binding("opacity", "hide", h => h ? 0 : 1),
        new go.Binding("pickable", "hide", h => !h),
        $(go.Panel,
          { name: "ICON" },
          $(go.Shape, "Square",
            { width: 40, height: 40, strokeWidth: 2, fill: "white", stroke: "#919191", portId: "" }),
          $(go.Panel,
            { // for each attribute show a Shape at a particular place in the overall square
              itemTemplate:
                $(go.Panel,
                  $(go.Shape,
                    { stroke: null, strokeWidth: 0 },
                    new go.Binding("fill", "", attrFill),
                    new go.Binding("geometry", "", attrShape))
                ),
              margin: 1
            },
            new go.Binding("itemArray", "attributes")
          )
        ),
        $(go.TextBlock,
          { textAlign: "center", maxSize: new go.Size(80, NaN), background: "rgba(255,255,255,0.5)" },
          new go.Binding("text", "name"))
      ));

    myDiagram.nodeTemplateMap.add("F",  // female
      $(go.Node, "Vertical",
        { locationSpot: go.Spot.Center, locationObjectName: "ICON",
          selectionObjectName: "ICON" },
        new go.Binding("opacity", "hide", h => h ? 0 : 1),
        new go.Binding("pickable", "hide", h => !h),
        $(go.Panel,
          { name: "ICON" },
          $(go.Shape, "Circle",
            { width: 40, height: 40, strokeWidth: 2, fill: "white", stroke: "#a1a1a1", portId: "" }),
          $(go.Panel,
            { // for each attribute show a Shape at a particular place in the overall circle
              itemTemplate:
                $(go.Panel,
                  $(go.Shape,
                    { stroke: null, strokeWidth: 0 },
                    new go.Binding("fill", "", attrFill),
                    new go.Binding("geometry", "", attrShape))
                ),
              margin: 1
            },
            new go.Binding("itemArray", "attributes")
          )
        ),
        $(go.TextBlock,
          { textAlign: "center", maxSize: new go.Size(80, NaN), background: "rgba(255,255,255,0.5)" },
          new go.Binding("text", "name"))
      ));

    // the representation of each label node -- nothing shows on a Marriage Link
    myDiagram.nodeTemplateMap.add("LinkLabel",
      $(go.Node,
        { selectable: false, width: 1, height: 1, fromEndSegmentLength: 20 }));

    myDiagram.linkTemplate =  // for parent-child relationships
      $(go.Link,
        { routing: go.Link.Orthogonal, corner: 10, curviness: 15, 
          layerName: "Background", selectable: false },
        $(go.Shape, { stroke: "gray", strokeWidth: 2 })
      );

    myDiagram.linkTemplateMap.add("Marriage",  // for marriage relationships
      $(go.Link,
        // AvoidsNodes routing might be better when people have multiple marriages
        { routing: go.Link.AvoidsNodes, corner: 10,
          fromSpot: go.Spot.LeftRightSides, toSpot: go.Spot.LeftRightSides,
          selectable: false, isTreeLink: false, layerName: "Background" },
        $(go.Shape, { strokeWidth: 2.5, stroke: "#5d8cc1" /* blue */ })
      ));

    return myDiagram;
  }

  // create and initialize the Diagram.model given an array of node data representing people
  private setupDiagram(diagram: go.Diagram) {
    diagram.model =
      new go.GraphLinksModel(
        { // declare support for link label nodes
          linkLabelKeysProperty: "labelKeys",
          // this property determines which template is used
          nodeCategoryProperty: "s",
          // if a node data object is copied, copy its data.attributes Array
          copiesArrays: true,
          nodeDataArray: this.diagramRef.current?.props.nodeDataArray
        });
    this.setupMarriages(diagram);
    this.setupParents(diagram);
  }

  // now process the node data to determine marriages
  private setupMarriages(diagram: any) {
    const model = diagram.model;
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
            console.log("cannot create Marriage relationship with self or unknown person " + spouse);
            continue;
          }
          const link = this.findMarriage(diagram, key, spouse);
          if (link === null) {
            // add a label node for the marriage link
            const mlab = { s: "LinkLabel", key: undefined };
            model.addNodeData(mlab);
            // add the marriage link itself, also referring to the label node
            const mdata = { from: key, to: spouse, labelKeys: [mlab.key], category: "Marriage" };
            model.addLinkData(mdata);
          }
        }
      }
    }
  }

  // process parent-child relationships once all marriages are known
  private setupParents(diagram: any) {
    const model = diagram.model;
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
          console.log("unknown marriage: " + mother + " & " + father);
          continue;
        }
        const mdata = link.data;
        if (mdata.labelKeys === undefined || mdata.labelKeys[0] === undefined) continue;
        const mlabkey = mdata.labelKeys[0];
        const cdata = { from: mlabkey, to: key };
        diagram.model.addLinkData(cdata);
      }
    }
  }

  private findMarriage(diagram: go.Diagram, a: string | number, b: string | number) {  // A and B are node keys
    const nodeA = diagram.findNodeForKey(a);
    const nodeB = diagram.findNodeForKey(b);
    if (nodeA !== null && nodeB !== null) {
      const it = nodeA.findLinksBetween(nodeB);  // in either direction
      while (it.next()) {
        const link = it.value;
        // Link.data.category === "Marriage" means it's a marriage relationship
        if (link.data !== null && link.data.category === "Marriage") return link;
      }
    }
    return null;
  }

  public render() {
    const { trees, depth } = this.props;
    const personNodes = treesToPersonNode(trees, depth || 0);

    return (
      <ReactDiagram
        ref={this.diagramRef}
        divClassName='diagram-component'
        initDiagram={this.initDiagram}
        nodeDataArray={personNodes}
      />
    );
  }
}

export default FamilyDiagram;
