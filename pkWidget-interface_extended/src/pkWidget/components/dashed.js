const dashed = (parentDiv, settings) => {
  if (!parentDiv) return;
  
  const div = document.createElement('div');
  parentDiv.appendChild(div);
  div.className = 'dashed';
  
  const namespace = 'http://www.w3.org/2000/svg';
  const svg = document.createElementNS(namespace, 'svg');
  div.appendChild(svg);
  
  const rect = document.createElementNS(namespace, 'rect');
  svg.appendChild(rect);

  rect.setAttribute('rx', settings.radius - settings.width / 2);
  rect.setAttribute('stroke-width', settings.width);
  rect.setAttribute('stroke-dasharray', settings.dashArray);
  rect.setAttribute('stroke', settings.color);
  rect.setAttribute('fill', 'transparent');

  new ResizeObserver(() => {
    const parentDim = parentDiv.getBoundingClientRect();
    if (parentDim.width === 0 || parentDim.height === 0) return;

    svg.setAttribute('viewBox', `0 0 ${parentDim.width} ${parentDim.height}`);
    rect.setAttribute('x', settings.width / 2);
    rect.setAttribute('y', settings.width / 2);
    rect.setAttribute('width', parentDim.width - settings.width);
    rect.setAttribute('height', parentDim.height - settings.width);
  }).observe(parentDiv);

  return div;
}

export default dashed;