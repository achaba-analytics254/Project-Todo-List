export class DragDropHelper {
  createDragImage(element, todo) {
    const dragImage = element.cloneNode(true);
    dragImage.style.width = `${element.offsetWidth}px`;
    dragImage.style.opacity = '0.8';
    dragImage.style.position = 'absolute';
    dragImage.style.top = '-1000px';
    dragImage.style.left = '-1000px';
    dragImage.style.background = 'white';
    dragImage.style.boxShadow = '0 4px 8px rgba(0,0,0,0.2)';
    dragImage.style.borderRadius = '8px';
    dragImage.style.transform = 'rotate(2deg)';
    dragImage.classList.add('drag-image');
    
    const infoDiv = document.createElement('div');
    infoDiv.className = 'drag-info';
    infoDiv.style.padding = '5px 10px';
    infoDiv.style.background = '#3498db';
    infoDiv.style.color = 'white';
    infoDiv.style.fontSize = '12px';
    infoDiv.style.borderRadius = '0 0 8px 8px';
    infoDiv.innerHTML = `
      <span>Moving: ${todo.title}</span>
      <span style="margin-left: 10px; padding: 2px 6px; background: white; color: #3498db; border-radius: 4px;">
        ${todo.priority}
      </span>
    `;
    dragImage.appendChild(infoDiv);
    
    document.body.appendChild(dragImage);
    return dragImage;
  }

getDragAfterElement(container, y) {
    if (!container || typeof container.querySelectorAll !== 'function') {
        console.warn('Invalid container provided to getDragAfterElement');
        return null;
    }
    
    try {
        const draggableElements = container.querySelectorAll('.draggable:not(.dragging)');
        
        return [...draggableElements].reduce((closest, child) => {
            const box = child.getBoundingClientRect();
            const offset = y - box.top - box.height / 2;
            
            if (offset < 0 && offset > closest.offset) {
                return { offset: offset, element: child };
            } else {
                return closest;
            }
        }, { offset: Number.NEGATIVE_INFINITY }).element;
    } catch (error) {
        console.error('Error in getDragAfterElement:', error);
        return null;
    }
}

  calculateDropPosition(container, y) {
    const afterElement = this.getDragAfterElement(container, y);
    return afterElement;
  }

  addVisualFeedback(element, className = 'drag-over') {
    element.classList.add(className);
  }

  removeVisualFeedback(element, className = 'drag-over') {
    element.classList.remove(className);
  }
}