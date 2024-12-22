const canvas = document.getElementById('graphCanvas');
const ctx = canvas.getContext('2d');

const graph = {}; // Stores nodes and edges
const positions = {}; // Stores node positions

// Add Edge
document.getElementById('addEdgeForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const from = document.getElementById('fromNode').value.toUpperCase();
    const to = document.getElementById('toNode').value.toUpperCase();
    const cost = Number(document.getElementById('cost').value);

    graph[from] = graph[from] || [];
    graph[from].push({ node: to, cost });
    graph[to] = graph[to] || []; // Ensure bidirectional graph
    graph[to].push({ node: from, cost });

    positions[from] = positions[from] || getRandomPosition();
    positions[to] = positions[to] || getRandomPosition();

    drawGraph();
    e.target.reset();
});

// BFS, DFS, and UCS
function startSearch(searchType) {
    const start = prompt("Enter Start Node:").toUpperCase();
    const goal = prompt("Enter Goal Node:").toUpperCase();
    let result;

    if (searchType === 'BFS') {
        result = bfs(start, goal);
    } else if (searchType === 'DFS') {
        result = dfs(start, goal);
    } else if (searchType === 'UCS') {
        result = ucs(start, goal);
    }

    const { path, totalCost } = result;
    alert(path.length ? 
        `${searchType} Path: ${path.join(' -> ')}\nCost: ${totalCost}` : 
        "No Path Found");
}

document.getElementById('startButton').addEventListener('click', () => startSearch('BFS')); // BFS
document.getElementById('startDFSButton').addEventListener('click', () => startSearch('DFS')); // DFS
document.getElementById('startUCSButton').addEventListener('click', () => startSearch('UCS')); // UCS

// BFS Function
function bfs(start, goal) {
    const queue = [[start]];
    const visited = new Set();
    while (queue.length) {
        const path = queue.shift();
        const node = path[path.length - 1];
        if (node === goal) return { path, totalCost: calculateCost(path) };
        if (!visited.has(node)) {
            visited.add(node);
            (graph[node] || []).forEach(({ node: neighbor }) => {
                if (!visited.has(neighbor)) {
                    queue.push([...path, neighbor]);
                }
            });
        }
    }
    return { path: [], totalCost: 0 };
}

// DFS Function
function dfs(start, goal) {
    const stack = [[start]];
    const visited = new Set();
    while (stack.length) {
        const path = stack.pop();
        const node = path[path.length - 1];
        if (node === goal) return { path, totalCost: calculateCost(path) };
        if (!visited.has(node)) {
            visited.add(node);
            (graph[node] || []).forEach(({ node: neighbor }) => {
                if (!visited.has(neighbor)) {
                    stack.push([...path, neighbor]);
                }
            });
        }
    }
    return { path: [], totalCost: 0 };
}

// UCS Function
function ucs(start, goal) {
    const visited = new Set();
    const pq = new PriorityQueue();
    pq.enqueue({ node: start, path: [start], cost: 0 }, 0);

    while (!pq.isEmpty()) {
        const { element: current } = pq.dequeue();
        const { node, path, cost } = current;

        if (node === goal) return { path, totalCost: cost };
        if (!visited.has(node)) {
            visited.add(node);
            (graph[node] || []).forEach(({ node: neighbor, cost: edgeCost }) => {
                if (!visited.has(neighbor)) {
                    pq.enqueue({ node: neighbor, path: [...path, neighbor], cost: cost + edgeCost }, cost + edgeCost);
                }
            });
        }
    }
    return { path: [], totalCost: 0 };
}

// Priority Queue Implementation for UCS
class PriorityQueue {
    constructor() {
        this.items = [];
    }

    enqueue(element, priority) {
        const queueElement = { element, priority };
        let added = false;
        for (let i = 0; i < this.items.length; i++) {
            if (queueElement.priority < this.items[i].priority) {
                this.items.splice(i, 0, queueElement);
                added = true;
                break;
            }
        }
        if (!added) this.items.push(queueElement);
    }

    dequeue() {
        return this.items.shift();
    }

    isEmpty() {
        return this.items.length === 0;
    }
}

// Calculate Total Cost
function calculateCost(path) {
    return path.reduce((cost, node, index) => {
        if (index === 0) return cost;
        const prevNode = path[index - 1];
        const edge = graph[prevNode]?.find(e => e.node === node);
        return cost + (edge ? edge.cost : 0);
    }, 0);
}

// Draw Graph
function drawGraph() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw Edges
    for (const from in graph) {
        graph[from].forEach(({ node: to, cost }) => {
            const startPos = positions[from];
            const endPos = positions[to];
            ctx.beginPath();
            ctx.moveTo(startPos.x, startPos.y);
            ctx.lineTo(endPos.x, endPos.y);
            ctx.stroke();
            ctx.fillText(cost, (startPos.x + endPos.x) / 2, (startPos.y + endPos.y) / 2);
        });
    }

    // Draw Nodes
    for (const node in positions) {
        const { x, y } = positions[node];
        ctx.beginPath();
        ctx.arc(x, y, 20, 0, Math.PI * 2);
        ctx.stroke();
        ctx.fillText(node, x - 5, y + 5);
    }
}

// Generate Random Position
function getRandomPosition() {
    return { x: Math.random() * 700 + 50, y: Math.random() * 500 + 50 };
}

drawGraph();
