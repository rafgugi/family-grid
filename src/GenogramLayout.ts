import * as go from 'gojs';

class GenogramLayout extends go.LayeredDigraphLayout {
  spouseSpacing: number;

  constructor() {
    super();
    this.alignOption = go.LayeredDigraphLayout.AlignAll;
    this.initializeOption = go.LayeredDigraphLayout.InitDepthFirstIn;
    this.spouseSpacing = 30; // minimum space between spouses
    this.isRouting = false;
  }

  makeNetwork(coll: any) {
    // generate LayoutEdges for each parent-child Link
    const net = this.createNetwork();
    if (coll instanceof go.Diagram) {
      this.add(net, coll.nodes, true);
      this.add(net, coll.links, true);
    } else if (coll instanceof go.Group) {
      this.add(net, coll.memberParts, false);
    } else if (coll.iterator) {
      this.add(net, coll.iterator, false);
    }
    return net;
  }

  // internal method for creating LayeredDigraphNetwork where husband/wife pairs are represented
  // by a single LayeredDigraphVertex corresponding to the label Node on the marriage Link
  add(net: any, coll: any, nonmemberonly: boolean) {
    const horiz = this.direction === 0.0 || this.direction === 180.0;
    const multiSpousePeople = new go.Set();
    // consider all Nodes in the given collection
    const it = coll.iterator;
    while (it.next()) {
      const node = it.value;
      if (!(node instanceof go.Node) || !node.data) continue;
      if (!node.isLayoutPositioned || !node.isVisible()) continue;
      if (nonmemberonly && node.containingGroup !== null) continue;
      // if it's an unmarried Node, or if it's a Link Label Node, create a LayoutVertex for it
      if (node.isLinkLabel) {
        // get marriage Link
        const link = node?.labeledLink;
        if (link?.category === 'Marriage') {
          const spouseA = link.fromNode;
          const spouseB = link.toNode;
          // create vertex representing both husband and wife
          const vertex = net.addNode(node);
          // now define the vertex size to be big enough to hold both spouses
          const spouseAwidth = spouseA?.actualBounds.width || 0;
          const spouseBwidth = spouseB?.actualBounds.width || 0;
          const spouseAheight = spouseA?.actualBounds.height || 0;
          const spouseBheight = spouseB?.actualBounds.height || 0;
          if (horiz) {
            vertex.height = spouseAheight + this.spouseSpacing + spouseBheight;
            vertex.width = Math.max(spouseAwidth, spouseBwidth);
            vertex.focus = new go.Point(
              vertex.width / 2,
              spouseAheight + this.spouseSpacing / 2
            );
          } else {
            vertex.width = spouseAwidth + this.spouseSpacing + spouseBwidth;
            vertex.height = Math.max(spouseAheight, spouseBheight);
            vertex.focus = new go.Point(
              spouseAwidth + this.spouseSpacing / 2,
              vertex.height / 2
            );
          }
        }
      } else {
        // don't add a vertex for any married person!
        // instead, code above adds label node for marriage link
        // assume a marriage Link has a label Node
        let marriages = 0;
        node.linksConnected.each(l => {
          if (l.category === 'Marriage') marriages++;
        });
        if (marriages === 0) {
          net.addNode(node);
        } else if (marriages > 1) {
          multiSpousePeople.add(node);
        }
      }
    }
    // now do all Links
    it.reset();
    while (it.next()) {
      const link = it.value;
      if (!(link instanceof go.Link)) continue;
      if (!link.isLayoutPositioned || !link.isVisible()) continue;
      if (nonmemberonly && link.containingGroup !== null) continue;
      // if it's a parent-child link, add a LayoutEdge for it
      if (link.category === '' && link.data) {
        const parent = net.findVertex(link.fromNode); // should be a label node
        const child = net.findVertex(link.toNode);
        if (child !== null) {
          // an unmarried child
          net.linkVertexes(parent, child, link);
        } else {
          // a married child
          link.toNode?.linksConnected.each(l => {
            // if it has no label node, it's a parent-child link
            if (l.category !== 'Marriage' || !l.data) return;

            // found the Marriage Link, now get its label Node
            const mlab = l.labelNodes.first();
            // parent-child link should connect with the label node,
            // so the LayoutEdge should connect with the LayoutVertex representing the label node
            const mlabvert = net.findVertex(mlab);
            if (mlabvert !== null) {
              net.linkVertexes(parent, mlabvert, link);
            }
          });
        }
      }
    }

    while (multiSpousePeople.count > 0) {
      // find all collections of people that are indirectly married to each other
      const node = multiSpousePeople.first();
      const cohort = new go.Set();
      this.extendCohort(cohort, node);
      // then encourage them all to be the same generation by connecting them all with a common vertex
      const dummyvert = net.createVertex();
      net.addVertex(dummyvert);
      const marriages = new go.Set();
      cohort.each((n: any) => {
        n.linksConnected.each((l: any) => {
          marriages.add(l);
        });
      });
      marriages.each((link: any) => {
        // find the vertex for the marriage link (i.e. for the label node)
        const mlab = link.labelNodes.first();
        const v = net.findVertex(mlab);
        if (v !== null) {
          net.linkVertexes(dummyvert, v, null);
        }
      });
      // done with these people, now see if there are any other multiple-married people
      multiSpousePeople.removeAll(cohort);
    }
  }

  // collect all of the people indirectly married with a person
  extendCohort(coll: any, node: any) {
    if (coll.has(node)) return;
    coll.add(node);
    node.linksConnected.each((l: any) => {
      if (l.category === 'Marriage') {
        // if it's a marriage link, continue with both spouses
        this.extendCohort(coll, l.fromNode);
        this.extendCohort(coll, l.toNode);
      }
    });
  }

  assignLayers() {
    super.assignLayers();
    const horiz = this.direction === 0.0 || this.direction === 180.0;
    // for every vertex, record the maximum vertex width or height for the vertex's layer
    const maxsizes: number[] = [];
    this.network?.vertexes.each((v: any) => {
      const lay = v.layer;
      let max = maxsizes[lay];
      if (max === undefined) max = 0;
      const sz = horiz ? v.width : v.height;
      if (sz > max) maxsizes[lay] = sz;
    });
    // now make sure every vertex has the maximum width or height according to which layer it is in,
    // and aligned on the left (if horizontal) or the top (if vertical)
    this.network?.vertexes.each((v: any) => {
      const lay = v.layer;
      const max = maxsizes[lay];
      if (horiz) {
        v.focus = new go.Point(0, v.height / 2);
        v.width = max;
      } else {
        v.focus = new go.Point(v.width / 2, 0);
        v.height = max;
      }
    });
    // from now on, the LayeredDigraphLayout will think that the Node is bigger than it really is
    // (other than the ones that are the widest or tallest in their respective layer).
  }

  initializeIndices() {
    super.initializeIndices();
    const vertical = this.direction === 90 || this.direction === 270;
    this.network?.edges.each((e: any) => {
      if (e.fromVertex?.node && e.fromVertex?.node.isLinkLabel) {
        e.portFromPos = vertical ? e.fromVertex?.focusX : e.fromVertex?.focusY;
      }
      if (e.toVertex?.node && e.toVertex?.node.isLinkLabel) {
        e.portToPos = vertical ? e.toVertex?.focusX : e.toVertex?.focusY;
      }
    });
  }

  commitNodes() {
    super.commitNodes();
    // position regular nodes
    this.network?.vertexes.each(v => {
      if (v.node !== null && !v.node.isLinkLabel) {
        v.node.position = new go.Point(v.x, v.y);
      }
    });

    const horiz = this.direction === 0.0 || this.direction === 180.0;
    // position the spouses of each marriage vertex
    this.network?.vertexes.each(v => {
      if (v.node === null) return;
      if (!v.node.isLinkLabel) return;
      const labnode = v.node;
      const lablink = labnode.labeledLink;
      // In case the spouses are not actually moved, we need to have the marriage link
      // position the label node, because LayoutVertex.commit() was called above on these vertexes.
      // Alternatively we could override LayoutVetex.commit to be a no-op for label node vertexes.
      lablink?.invalidateRoute();
      let spouseA = lablink?.fromNode;
      let spouseB = lablink?.toNode;
      if (Number(spouseA?.opacity) > 0 && Number(spouseB?.opacity) > 0) {
        // prefer fathers on the left, mothers on the right
        // if (spouseA?.category === "F") {  // sex is female
        //   const temp = spouseA;
        //   spouseA = spouseB;
        //   spouseB = temp;
        // }
        // see if the parents are on the desired sides, to avoid a link crossing
        const aParentsNode = this.findParentsMarriageLabelNode(spouseA);
        const bParentsNode = this.findParentsMarriageLabelNode(spouseB);
        if (
          aParentsNode !== null &&
          bParentsNode !== null &&
          (horiz
            ? aParentsNode.position.x > bParentsNode.position.x
            : aParentsNode.position.y > bParentsNode.position.y)
        ) {
          // swap the spouses
          const temp = spouseA;
          spouseA = spouseB;
          spouseB = temp;
        }
        spouseA?.moveTo(v.x, v.y);
        if (horiz) {
          spouseB?.moveTo(
            v.x,
            v.y + Number(spouseA?.actualBounds.height) + this.spouseSpacing
          );
        } else {
          spouseB?.moveTo(
            v.x + Number(spouseA?.actualBounds.width) + this.spouseSpacing,
            v.y
          );
        }
      } else if (spouseA?.opacity === 0) {
        const pos = horiz
          ? new go.Point(
              v.x,
              v.centerY - Number(spouseB?.actualBounds.height) / 2
            )
          : new go.Point(
              v.centerX - Number(spouseB?.actualBounds.width) / 2,
              v.y
            );
        spouseB?.move(pos);
        if (horiz) pos.y++;
        else pos.x++;
        spouseA?.move(pos);
      } else if (spouseB?.opacity === 0) {
        const pos = horiz
          ? new go.Point(
              v.x,
              v.centerY - Number(spouseA?.actualBounds.height) / 2
            )
          : new go.Point(
              v.centerX - Number(spouseA?.actualBounds.width) / 2,
              v.y
            );
        spouseA?.move(pos);
        if (horiz) pos.y++;
        else pos.x++;
        spouseB?.move(pos);
      }
      lablink?.ensureBounds();
    });
  }

  findParentsMarriageLabelNode(node: any) {
    const it = node.findNodesInto();
    while (it.next()) {
      const n = it.value;
      if (n.isLinkLabel) return n;
    }
    return null;
  }
} // end GenogramLayout class

export default GenogramLayout;
