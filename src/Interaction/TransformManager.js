export class TransformManager {
    constructor(elements, onUpdate) {
        this.elements = elements;
        this.onUpdate = onUpdate;
        this.state = { x: 0, y: 0, scale: 1, isDragging: false, startX: 0, startY: 0 };
    }

    applyZoom(factor, mX, mY) {
        const rect = this.elements.viewport.getBoundingClientRect();
        const mouseX = mX - rect.left;
        const mouseY = mY - rect.top;
        
        const newScale = Math.min(Math.max(this.state.scale * factor, 0.1), 3);
        
        this.state.x = mouseX - (mouseX - this.state.x) * (newScale / this.state.scale);
        this.state.y = mouseY - (mouseY - this.state.y) * (newScale / this.state.scale);
        this.state.scale = newScale;
        
        this.updateView();
    }

    updateView() {
        requestAnimationFrame(() => {
            const { holder } = this.elements;
            holder.style.transition = this.state.isDragging ? "none" : "transform 0.1s ease-out";
            holder.style.transform = `translate(${this.state.x}px, ${this.state.y}px) scale(${this.state.scale})`;
            if (this.onUpdate) this.onUpdate(this.state);
        });
    }

    fitToScreen(root, config) {
        const vRect = this.elements.viewport.getBoundingClientRect();
        let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;

        const traverse = n => {
            const x = n.x * config.spacingX;
            const y = n.realY;
            minX = Math.min(minX, x); maxX = Math.max(maxX, x + config.cardWidth);
            minY = Math.min(minY, y); maxY = Math.max(maxY, y + config.cardHeight);

            if (!n._collapsed && n.supports) {
                n.supports.forEach(s => {
                    minX = Math.min(minX, s.realX); maxX = Math.max(maxX, s.realX + config.cardWidth);
                    minY = Math.min(minY, s.realY); maxY = Math.max(maxY, s.realY + config.cardHeight);
                });
            }
            if (!n._collapsed && n.children) n.children.forEach(traverse);
        };

        traverse(root);
        const tW = maxX - minX; const tH = maxY - minY;
        const scale = Math.min((vRect.width - 100) / (tW || 1), (vRect.height - 100) / (tH || 1), 1);

        this.state.scale = scale;
        this.state.x = (vRect.width / 2) - ((minX + tW / 2) * scale);
        this.state.y = (vRect.height / 2) - ((minY + tH / 2) * scale);
        this.updateView();
    }
}