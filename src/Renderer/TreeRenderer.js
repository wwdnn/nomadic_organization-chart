import { UIFactory } from './UIFactory.js';

export class TreeRenderer {
    constructor(elements, config, settings) {
        this.elements = elements;
        this.config = config;
        this.settings = settings;
    }

    clear() {
        this.elements.nodes.innerHTML = "";
        this.elements.pathGroup.innerHTML = "";
    }

    draw(node, onRebuild) {
        const levelMaxGapOut = this.elements.levelMaxGapOut || {};
        
        this._renderRecursive(node, onRebuild, levelMaxGapOut);
    }

    _renderRecursive(node, onRebuild, levelMaxGapOut) {
        const cfg = this.settings[node.level] || this.settings[4];
        
        const card = UIFactory.createCard(node, this.config, {gradient: this._getGradientString(cfg)}, onRebuild);
        UIFactory.handleOverflow(card, this.config, node, onRebuild);
        
        if (this._hasSubElements(node)) {
            card.appendChild(UIFactory.createCollapseBtn(node._collapsed, () => {
                node._collapsed = !node._collapsed;
                onRebuild();
            }));
        }
        this.elements.nodes.appendChild(card);

        if (node._collapsed) return;

        if (node.supports) node.supports.forEach((sup, i) => this._renderSupport(node, sup, i, onRebuild));

        if (node.children?.length) this._renderChildren(node, onRebuild, levelMaxGapOut);
    }

    _renderSupport(parent, support, index, onRebuild) {
        const side = index % 2 === 0 ? "right" : "left";
        const parentCenterX = (parent.x * this.config.spacingX) + this.config.cardWidth / 2;
        
        support.realX = side === "right" 
            ? parentCenterX + this.config.supportOffset 
            : parentCenterX - this.config.supportOffset - this.config.cardWidth;
        
        const parentHeight = parent._customHeight || this.config.cardHeight;
        support.realY = parent.realY + parentHeight + 15 + (Math.floor(index / 2) * (this.config.cardHeight + 10));

        const sCard = UIFactory.createCard(support, this.config, {gradient: this._getGradientString(this.settings[support.level])}, onRebuild);
        UIFactory.handleOverflow(sCard, this.config, support, onRebuild);
        
        this.elements.nodes.appendChild(sCard);

        const connectX = side === "right" ? support.realX : support.realX + this.config.cardWidth;
        
        const d = `M ${parentCenterX} ${support.realY + (this.config.cardHeight / 2)} H ${connectX}`;
        this.elements.pathGroup.appendChild(UIFactory.createPath(d, this.config, true));
    }

    _renderChildren(parent, onRebuild, levelMaxGapOut) {
        const startX = (parent.x * this.config.spacingX) + this.config.cardWidth / 2;
        
        const parentHeight = parent._customHeight || this.config.cardHeight;
        const startY = parent.realY + parentHeight;

        const localGapOut = levelMaxGapOut[parent.y] || this.config.gapOut;
        const horizontalBusY = startY + localGapOut;

        parent.children.forEach(child => {
            const childX = (child.x * this.config.spacingX) + (this.config.cardWidth / 2);
            
            const d = `M ${startX} ${startY} V ${horizontalBusY} H ${childX} V ${child.realY}`;
            this.elements.pathGroup.appendChild(UIFactory.createPath(d, this.config, false));
            
            this._renderRecursive(child, onRebuild, levelMaxGapOut);
        });
    }

    _hasSubElements(node) {
        return (node.children?.length > 0 || node.supports?.length > 0);
    }

    _getGradientString(levelCfg) {
        if (!levelCfg) return 'gray';
        const stops = [...levelCfg.stops].sort((a, b) => a.pos - b.pos);
        const stopString = stops.map(s => `${s.color} ${s.pos}%`).join(', ');

        return {
            css: `linear-gradient(${levelCfg.angle}deg, ${stopString})`,
            stops: stops
        }
    }
}