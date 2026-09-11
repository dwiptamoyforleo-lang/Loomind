import { ThoughtNode, LoomindData } from '../types';

/**
 * Builds a hierarchical adjacency map (parentId -> childrenIds)
 */
export function buildChildrenMap(nodes: Record<string, ThoughtNode>): Record<string, string[]> {
  const map: Record<string, string[]> = {};
  for (const node of Object.values(nodes)) {
    if (node.parentId) {
      if (!map[node.parentId]) {
        map[node.parentId] = [];
      }
      map[node.parentId].push(node.id);
    }
  }
  return map;
}

/**
 * Balanced horizontal tree layout (auto-arrange)
 * Root in center; half children to the right, half to the left.
 */
export function applyAutoLayout(
  nodes: Record<string, ThoughtNode>,
  rootId: string
): Record<string, ThoughtNode> {
  const newNodes = { ...nodes };
  const root = newNodes[rootId];
  if (!root) return nodes;

  const childrenMap = buildChildrenMap(newNodes);
  const directChildren = childrenMap[rootId] || [];

  newNodes[rootId] = { ...root, x: 0, y: 0 };

  const leftChildren: string[] = [];
  const rightChildren: string[] = [];

  directChildren.forEach((childId, index) => {
    if (index % 2 === 0) {
      rightChildren.push(childId);
    } else {
      leftChildren.push(childId);
    }
  });

  const layoutSubtree = (
    nodeId: string,
    depth: number,
    direction: 'left' | 'right',
    startY: number
  ): number => {
    const children = childrenMap[nodeId] || [];
    const isVisible = !newNodes[nodeId]?.isCollapsed;

    const xOffset = direction === 'right' ? depth * 280 : -depth * 280;

    if (children.length === 0 || !isVisible) {
      if (nodeId !== rootId) {
        newNodes[nodeId] = {
          ...newNodes[nodeId],
          x: xOffset,
          y: startY,
        };
      }
      return startY + 80;
    }

    let currentY = startY;
    const childYs: number[] = [];

    for (const childId of children) {
      const nextY = layoutSubtree(childId, depth + 1, direction, currentY);
      childYs.push(currentY);
      currentY = nextY;
    }

    const midY = (childYs[0] + childYs[childYs.length - 1]) / 2;

    if (nodeId !== rootId) {
      newNodes[nodeId] = {
        ...newNodes[nodeId],
        x: xOffset,
        y: midY,
      };
    }

    return currentY;
  };

  // Layout Right side
  let rightTotalY = 0;
  let currentRightY = -(rightChildren.length * 80) / 2;
  for (const childId of rightChildren) {
    currentRightY = layoutSubtree(childId, 1, 'right', currentRightY);
  }

  // Layout Left side
  let currentLeftY = -(leftChildren.length * 80) / 2;
  for (const childId of leftChildren) {
    currentLeftY = layoutSubtree(childId, 1, 'left', currentLeftY);
  }

  return newNodes;
}

/**
 * Generate cubic bezier curve path string between two coordinates
 */
export function getBezierPath(
  fromX: number,
  fromY: number,
  toX: number,
  toY: number,
  nodeWidth = 200,
  nodeHeight = 60
): string {
  // Determine relative orientation
  const isRight = toX >= fromX;
  const startX = isRight ? fromX + nodeWidth / 2 : fromX - nodeWidth / 2;
  const startY = fromY;
  const endX = isRight ? toX - nodeWidth / 2 : toX + nodeWidth / 2;
  const endY = toY;

  const dx = Math.abs(endX - startX) * 0.55;
  const control1X = isRight ? startX + dx : startX - dx;
  const control1Y = startY;
  const control2X = isRight ? endX - dx : endX + dx;
  const control2Y = endY;

  return `M ${startX} ${startY} C ${control1X} ${control1Y}, ${control2X} ${control2Y}, ${endX} ${endY}`;
}

/**
 * Generate markdown representation of the mind map
 */
export function exportToMarkdown(data: LoomindData): string {
  const { rootId, nodes, weaves, title } = data;
  const childrenMap = buildChildrenMap(nodes);

  let md = `# ${title}\n\n`;

  function traverse(nodeId: string, depth: number) {
    const node = nodes[nodeId];
    if (!node) return;

    const prefix = '  '.repeat(depth) + '- ';
    const statusTag = node.status ? ` [${node.status}]` : '';
    const tags = node.tags && node.tags.length > 0 ? ` #${node.tags.join(' #')}` : '';

    md += `${prefix}**${node.title}**${statusTag}${tags}\n`;
    if (node.notes) {
      const noteIndent = '  '.repeat(depth + 1);
      md += `${noteIndent}> ${node.notes.replace(/\n/g, `\n${noteIndent}> `)}\n`;
    }

    const children = childrenMap[nodeId] || [];
    for (const childId of children) {
      traverse(childId, depth + 1);
    }
  }

  traverse(rootId, 0);

  if (weaves.length > 0) {
    md += `\n## Weaved Relationships\n\n`;
    for (const weave of weaves) {
      const fromNode = nodes[weave.fromId];
      const toNode = nodes[weave.toId];
      if (fromNode && toNode) {
        const label = weave.label ? ` (${weave.label})` : '';
        md += `- **${fromNode.title}** ↔ **${toNode.title}**${label}\n`;
      }
    }
  }

  return md;
}
