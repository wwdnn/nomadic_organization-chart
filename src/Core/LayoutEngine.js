export class LayoutEngine {
    constructor(config) {
        this.config = config;
        this.levelMaxGapOut = {};
    }

    calculate(root) {
        console.log("LayoutEngine: Calculate triggered", root);
        this.levelMaxGapOut = {}; 
        this._initializeNodes(root, 0);
        this._calculateInitialX(root, null, []);
        this._checkAllChildrenOnScreen(root);
        this._calculateFinalPositions(root, 0);
        this._calculateLevelGapOuts(root);
        
        root.realY = 40;
        this._assignRealY(root);
        
        return root;
    }

    _initializeNodes(node, depth) {
        node.x = -1; node.y = depth; node.mod = 0;
        if (!node._collapsed && node.children) {
            node.children.forEach(child => this._initializeNodes(child, depth + 1));
        }
    }

    _calculateInitialX(node, leftSibling, allPreviousSiblings) {
        const children = (!node._collapsed && node.children) ? node.children : [];
        let currentSiblings = [];
        children.forEach((child, i) => {
            this._calculateInitialX(child, children[i - 1] || null, currentSiblings);
            currentSiblings.push(child);
        });

        if (children.length === 0) {
            node.x = leftSibling ? leftSibling.x + 1 : 0;
        } else if (children.length === 1) {
            if (!leftSibling) { node.x = children[0].x; } 
            else { node.x = leftSibling.x + 1; node.mod = node.x - children[0].x; }
        } else {
            const leftChild = children[0]; const rightChild = children[children.length - 1];
            const mid = (leftChild.x + rightChild.x) / 2;
            if (!leftSibling) { node.x = mid; } 
            else { node.x = leftSibling.x + 1; node.mod = node.x - mid; }
        }
        if (children.length > 0 && leftSibling) this._checkForConflicts(node, allPreviousSiblings);
    }

    _checkForConflicts(node, allPreviousSiblings) {
        const minDistance = 1;
        let shiftValue = 0;
        const nodeContour = {};
        this._getContour(node, 0, nodeContour, 'left');
        
        allPreviousSiblings.forEach(sibling => {
            const siblingContour = {};
            this._getContour(sibling, 0, siblingContour, 'right');
            Object.keys(nodeContour).forEach(y => {
                if (siblingContour[y] !== undefined) {
                    const distance = nodeContour[y] - siblingContour[y];
                    if (distance + shiftValue < minDistance) shiftValue = minDistance - distance;
                }
            });
            if (shiftValue > 0) { node.x += shiftValue; node.mod += shiftValue; shiftValue = 0; }
        });
    }

    _getContour(node, modSum, values, side) {
        const x = node.x + modSum;
        values[node.y] = (values[node.y] === undefined) 
            ? x 
            : (side === 'left' ? Math.min(values[node.y], x) : Math.max(values[node.y], x));
        
        if (!node._collapsed && node.children) {
            node.children.forEach(child => this._getContour(child, modSum + node.mod, values, side));
        }
    }

    _checkAllChildrenOnScreen(root) {
        const nodeContour = {};
        this._getContour(root, 0, nodeContour, 'left');
        let shiftAmount = 0;
        Object.values(nodeContour).forEach(x => { if (x + shiftAmount < 0) shiftAmount = x * -1; });
        if (shiftAmount > 0) { root.x += shiftAmount; root.mod += shiftAmount; }
    }

    _calculateFinalPositions(node, modSum) {
        node.x += modSum;
        if (!node._collapsed && node.children) {
            node.children.forEach(child => this._calculateFinalPositions(child, modSum + node.mod));
        }
    }

    _calculateLevelGapOuts(node) {
        const level = node.y;
        const supportCount = (!node._collapsed && node.supports) ? node.supports.length : 0;
        const supportStacks = Math.ceil(supportCount / 2);
        const requiredGap = supportStacks > 0 
            ? (supportStacks * (this.config.cardHeight + 15)) + 20 
            : this.config.gapOut;
            
        if (!this.levelMaxGapOut[level] || requiredGap > this.levelMaxGapOut[level]) {
            this.levelMaxGapOut[level] = requiredGap;
        }
        if (!node._collapsed && node.children) {
            node.children.forEach(child => this._calculateLevelGapOuts(child));
        }
    }

    _assignRealY(node) {
        if (!node._collapsed && node.children) {
            const localGapOut = this.levelMaxGapOut[node.y] || this.config.gapOut;
            node.children.forEach(child => {
                child.realY = node.realY + (node._customHeight || this.config.cardHeight) + localGapOut + this.config.gapIn + 
                              ((child.subLevel || 0) * (this.config.cardHeight + this.config.subLevelGap));
                this._assignRealY(child);
            });
        }
    }
}