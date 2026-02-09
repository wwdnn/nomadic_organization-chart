function getContrastColor(hexColor) {
    if (!hexColor) return '#1e293b';
    
    const hex = hexColor.replace('#', '');
    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);
    
    const yiq = (r * 299 + g * 587 + b * 114) / 1000;
    return yiq >= 128 ? '#1e293b' : '#ffffff';
};

export const UIFactory = {
    

    createCard(node, config, options, onRebuild) {
        const card = document.createElement('div');
        
        const firstColor = options.gradient && options.gradient.stops && options.gradient.stops.length > 0 
            ? options.gradient.stops[0].color 
            : '#ffffff';
            
        const textColor = getContrastColor(firstColor);

        const leftPos = node.realX !== undefined ? node.realX : (node.x * config.spacingX);
        const topPos = node.realY;

        const currentHeight = node._isContentExpanded ? node._customHeight : config.cardHeight;
        const zIndex = node._isContentExpanded ? 100 : 10;

        card.className = "nomadic-card";
        card.style.cssText = `
            position: absolute; 
            width: ${config.cardWidth}px; 
            height: ${currentHeight}px;
            background: white; 
            border: 1px solid #e2e8f0; 
            border-radius: 12px;
            left: ${leftPos}px; 
            top: ${topPos}px; 
            display: flex; 
            flex-direction: column; 
            box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
            z-index: ${zIndex};
            pointer-events: auto;
            overflow: visible;
            transition: height 0.3s ease;
        `;

        card.innerHTML = `
            <div class="card-header" style="width:100%; border-radius: 10px; background: ${options.gradient.css}; flex-shrink: 0;">
                <div class="card-title" style="display:flex; align-items:center; justify-content:center; font-family:sans-serif; font-size:18px; font-weight:bold; color: ${textColor}; padding:15px; text-align:center;">
                    ${node.title || node.id}
                </div>
            </div>
            <div class="card-content" style="padding: 10px; font-family: sans-serif; font-size: 14px; color: #475569; overflow: hidden; flex-grow: 1;">
                ${node.content || ""}
            </div>
        `;

        // Add Show Less button if expanded
        if (node._isContentExpanded) {
             const btn = document.createElement('div');
             btn.style.cssText = `
                position: absolute; bottom: 0; left: 0; width: 100%; height: 20px;
                background: rgba(255,255,255,0.9); border-top: 1px solid #e2e8f0;
                display: flex; align-items: center; justify-content: center;
                cursor: pointer; font-size: 10px; color: #64748b; font-family: sans-serif; z-index: 10;
            `;
            btn.innerHTML = "▲";
            btn.onclick = (e) => {
                e.stopPropagation();
                node._isContentExpanded = false;
                node._customHeight = undefined;
                if (onRebuild) onRebuild();
            };
            card.appendChild(btn);
        }

        return card;
    },

    handleOverflow(card, config, node, onRebuild) {
        if (node._isContentExpanded) return;

        requestAnimationFrame(() => {
            if (card.scrollHeight > config.cardHeight) {
                const gradientOverlay = document.createElement('div');
                gradientOverlay.className = 'show-more-gradient';
                gradientOverlay.style.cssText = `
                    position: absolute; bottom: 0; left: 0; width: 100%; height: 60px;
                    background: linear-gradient(to bottom, rgba(255,255,255,0), rgba(255,255,255,1) 70%);
                    display: flex; align-items: flex-end; justify-content: center;
                    cursor: pointer; z-index: 20; border-bottom-left-radius: 10px; border-bottom-right-radius: 10px;
                `;
                
                const btn = document.createElement('div');
                btn.style.cssText = `
                    width: 100%; height: 20px;
                    display: flex; align-items: center; justify-content: center;
                    font-size: 10px; color: #64748b; font-family: sans-serif;
                `;
                btn.innerHTML = "▼";
                
                gradientOverlay.appendChild(btn);
                
                gradientOverlay.onclick = (e) => {
                    e.stopPropagation();
                    const prevHeight = card.style.height;
                    card.style.height = 'auto';
                    const fullHeight = card.scrollHeight;
                    card.style.height = prevHeight;
                    
                    if (fullHeight > config.cardHeight) {
                        node._customHeight = fullHeight + 20;
                        node._isContentExpanded = true;
                        if (onRebuild) onRebuild();
                    }
                };
                
                card.appendChild(gradientOverlay);
            }
        });
    },

    createCollapseBtn(isCollapsed, onClick) {
        const btn = document.createElement('div');
        btn.style.cssText = `
            position: absolute; bottom: -22px; left: 50%; transform: translateX(-50%);
            width: 20px; height: 20px; background: white; border: 2px solid #cbd5e1;
            border-radius: 50%; cursor: pointer; display: flex; align-items: center;
            justify-content: center; font-size: 14px; z-index: 100; font-weight: bold;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1); color: #475569;
        `;
        btn.innerHTML = isCollapsed ? "+" : "−";
        btn.onclick = (e) => {
            e.stopPropagation();
            onClick();
        };
        return btn;
    },

    createPath(d, isDashed = false) {
        const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
        path.setAttribute("d", d);
        path.setAttribute("stroke", "#cbd5e1");
        path.setAttribute("fill", "none");
        path.setAttribute("stroke-width", "2");
        if (isDashed) path.setAttribute("stroke-dasharray", "4");
        return path;
    },

    createLevelEditor(level, cfg) {
        const stopsStr = cfg.stops.map(s => `${s.color} ${s.pos}%`).join(', ');
        const div = document.createElement('div');
        div.className = "level-editor";
        div.style.cssText = "margin-bottom: 25px; padding: 15px; background: #f1f5f9; border-radius: 8px;";
        
        div.innerHTML = `
            <label style="font-size:12px; font-weight:bold; display:block; margin-bottom:10px;">${cfg.label}</label>
            <div class="grad-track" data-level="${level}" style="position:relative; height:20px; background:#ddd; border-radius:10px; cursor:copy; margin-bottom:30px; border:1px solid #ccc;">
                <div class="track-visual" style="position:absolute; inset:0; border-radius:10px; pointer-events:none; background: linear-gradient(90deg, ${stopsStr});"></div>
                ${this._createGradientStops(level, cfg.stops)}
            </div>
            <div style="display:flex; align-items:center; gap:10px;">
                <div class="angle-wheel" data-level="${level}" style="width:34px; height:34px; border:2px solid #94a3b8; border-radius:50%; position:relative; cursor:crosshair; background:white;">
                    <div class="needle" style="position:absolute; top:50%; left:50%; width:50%; height:2px; background:#1e293b; transform-origin:left; transform: translate(0, -50%) rotate(${cfg.angle - 90}deg);"></div>
                </div>
                <input type="number" class="angle-input" data-level="${level}" value="${cfg.angle}" style="width:50px; padding:4px; border:1px solid #cbd5e1; border-radius:4px;">
                <input type="color" class="color-pick" data-level="${level}" style="width:34px; height:34px; border:none; padding:0; background:none; cursor:pointer;">
                <button class="btn-del-stop" data-level="${level}" style="padding:4px 8px; color:white; background:#ef4444; border:none; border-radius:4px; font-size:10px; cursor:pointer;">Hapus</button>
            </div>
        `;
        return div;
    },

    _createGradientStops(level, stops) {
        return stops.map((s, i) => `
            <div class="grad-stop" 
                 data-level="${level}" 
                 data-index="${i}" 
                 style="position:absolute; left:${s.pos}%; top:50%; transform:translate(-50%,-50%); width:18px; height:18px; background:${s.color}; border:2px solid white; border-radius:50%; box-shadow:0 2px 5px rgba(0,0,0,0.4); cursor:grab; z-index:20;">
            </div>
        `).join('');
    }
};