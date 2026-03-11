import { format } from 'date-fns';
import { Todo } from './todo.js';
import { Project } from './project.js';
import { Storage } from './storage.js';
import { DragDropHelper } from './dragDrop.js';
import logoImage from '../images/logo.png'

export class userInterface {
  constructor() {
    this.projects = Storage.loadProjects();
    this.currentProject = this.projects[0] || null;
    this.currentFilter = 'all';
    this.draggedTodo = null;
    this.dragDropHelper = new DragDropHelper();
    
    this.initElements();
    this.initEventListeners();
    this.render();
  }

  initElements() {
    this.appContainer = document.getElementById("main-container");
    this.sidebar = document.getElementById('sidebar');
    this.mainContent = document.getElementById('main-content');


    
   
    this.newProjectBtn = document.getElementById('addProjectBtn');
    this.newTodoBtn = document.getElementById('addTodoBtn');
    

    this.filterAll = document.getElementById('period-all');
    this.filterToday = document.getElementById('period-today');
    this.filterWeek = document.getElementById('period-week');
    
   
    this.projectModal = document.getElementById('project-modal');
    this.todoModal = document.getElementById('modal');
    
   
    this.projectForm = document.getElementById('project-form');
    this.todoForm = document.getElementById('form');
  }

  initEventListeners() {
    // Project events
    this.newProjectBtn.addEventListener('click', () => this.showProjectModal());
    this.projectForm.addEventListener('submit', (e) => this.handleProjectSubmit(e));
    
    // Todo events
    this.newTodoBtn.addEventListener('click', () => this.showTodoModal());
    this.todoForm.addEventListener('submit', (e) => this.handleTodoSubmit(e));
    
    // Filter events
    this.filterAll.addEventListener('click', () => this.setFilter('all'));
    this.filterToday.addEventListener('click', () => this.setFilter('today'));
    this.filterWeek.addEventListener('click', () => this.setFilter('week'));
    
    // Close modal buttons
    document.querySelectorAll('.close-modal').forEach(btn => {
      btn.addEventListener('click', () => this.closeModals());
    });

    // Global drag and drop event listeners
    document.addEventListener('dragover', (e) => e.preventDefault());
    document.addEventListener('drop', (e) => e.preventDefault());
  }

  render() {
    this.renderSidebar();
    this.renderMainContent();
  }

  renderSidebar() {
    const projectList = document.getElementById('project-list');
    projectList.innerHTML = '';
    
    this.projects.forEach(project => {
      const projectItem = document.createElement('div');
      projectItem.className = `project-item ${this.currentProject?.id === project.id ? 'active' : ''}`;
      projectItem.setAttribute('data-project-id', project.id);
      
      // Make project items droppable
      projectItem.addEventListener('dragover', (e) => {
        e.preventDefault();
        projectItem.classList.add('drag-over');
      });

      projectItem.addEventListener('dragleave', () => {
        projectItem.classList.remove('drag-over');
      });

      projectItem.addEventListener('drop', (e) => {
        e.preventDefault();
        projectItem.classList.remove('drag-over');
        this.handleDropOnProject(e, project.id);
      });
      
      projectItem.innerHTML = `
        <div class="project-info" data-project-id="${project.id}">
          <span class="project-name">${project.name}</span>
          <span class="project-count">${project.getIncompleteTodos().length}</span>
        </div>
        <div class="project-actions">
          <button class="edit-project" data-id="${project.id}">✎</button>
          <button class="delete-project" data-id="${project.id}">🗑</button>
        </div>
      `;
      
      projectItem.querySelector('.project-info').addEventListener('click', () => {
        this.selectProject(project.id);
      });
      
      projectItem.querySelector('.edit-project').addEventListener('click', (e) => {
        e.stopPropagation();
        this.editProject(project.id);
      });
      
      projectItem.querySelector('.delete-project').addEventListener('click', (e) => {
        e.stopPropagation();
        this.deleteProject(project.id);
      });
      
      projectList.appendChild(projectItem);
    });
  }

renderMainContent() {
  if (!this.currentProject) {
    this.mainContent.innerHTML = `
      <div class="main-header">
        <h1>Todo List</h1>
        <button id="addTodoBtn" class="btn-primary">+ New Task</button>
      </div>
      <div class="no-project">Select or create a project</div>
    `;
    
    document.getElementById('addTodoBtn').addEventListener('click', () => {
      if (this.currentProject) {
        this.showTodoModal();
      } else {
        alert('Please select or create a project first');
      }
    });
    return;
  }
  
  let todos = [];
  switch(this.currentFilter) {
    case 'today':
      todos = this.currentProject.todos.filter(todo => todo.isDueToday());
      break;
    case 'week':
      todos = this.currentProject.todos.filter(todo => todo.isDueThisWeek());
      break;
    default:
      todos = this.currentProject.todos;
  }
  
  const content = `
    <div class="main-header">
      <h1>Todo List</h1>
      <button id="addTodoBtn" class="btn-primary">+ New Task</button>
    </div>
    <div class="project-header">
      <h2>${this.currentProject.name}</h2>
      <p class="project-description">${this.currentProject.description}</p>
    </div>
    <div class="todos-container" id="todos-container">
      ${todos.map(todo => this.renderTodoCard(todo)).join('')}
    </div>
  `;
  
  this.mainContent.innerHTML = content;
  
  // Re-attach new todo button event listener
  document.getElementById('addTodoBtn').addEventListener('click', () => {
    if (this.currentProject) {
      this.showTodoModal();
    } else {
      alert('Please select or create a project first');
    }
  });
  
  // Add drag and drop to todo container for reordering
  const todosContainer = document.getElementById('todos-container');
  todosContainer.addEventListener('dragover', (e) => {
    e.preventDefault();
    todosContainer.classList.add('drag-over');
  });

  todosContainer.addEventListener('dragleave', () => {
    todosContainer.classList.remove('drag-over');
  });

  todosContainer.addEventListener('drop', (e) => {
    e.preventDefault();
    todosContainer.classList.remove('drag-over');
    this.handleDropOnContainer(e);
  });
  
  // Add event listeners to todo cards
  this.currentProject.todos.forEach(todo => {
    const todoElement = document.getElementById(`todo-${todo.id}`);
    if (todoElement) {
      this.attachTodoEventListeners(todoElement, todo);
    }
  });
}

attachTodoEventListeners(todoElement, todo) {
  // Make todo draggable
  todoElement.setAttribute('draggable', 'true');
  
  todoElement.addEventListener('dragstart', (e) => {
    this.handleDragStart(e, todo.id);
  });

  todoElement.addEventListener('dragend', () => {
    this.handleDragEnd();
  });

  todoElement.addEventListener('dragover', (e) => {
    e.preventDefault();
    todoElement.classList.add('drag-over');
  });

  todoElement.addEventListener('dragleave', () => {
    todoElement.classList.remove('drag-over');
  });

  todoElement.addEventListener('drop', (e) => {
    e.preventDefault();
    todoElement.classList.remove('drag-over');
    this.handleDropOnTodo(e, todo.id);
  });
  
  todoElement.querySelector('.checkbox').addEventListener('change', (e) => {
    e.stopPropagation();
    this.toggleTodoComplete(todo.id);
  });
  
  todoElement.querySelector('.edit-todo').addEventListener('click', (e) => {
    e.stopPropagation();
    this.editTodo(todo.id);
  });
  
  todoElement.querySelector('.delete-todo').addEventListener('click', (e) => {
    e.stopPropagation();
    this.deleteTodo(todo.id);
  });
  
  todoElement.addEventListener('click', (e) => {
    if (!e.target.classList.contains('todo-checkbox') && 
        !e.target.classList.contains('edit-todo') && 
        !e.target.classList.contains('delete-todo')) {
    }
  });
}

  renderTodoCard(todo) {
    return `
      <div id="todo-${todo.id}" class="card ${todo.completed ? 'completed' : ''} ${todo.isOverdue() ? 'overdue' : ''}" draggable="true">
        <div class="todo-header">
          <input type="checkbox" class="checkbox" ${todo.completed ? 'checked' : ''}>
          <h3 class="card-title">${todo.title}</h3>
          <span class="priority ${todo.getPriorityClass()}">${todo.priority}</span>
        </div>
        <div class="todo-body">
          <p class="description">${todo.description || 'No description'}</p>
          <div class="todo-meta">
            <span class="todo-due">Due: ${todo.getFormattedDueDate()}</span>
            ${todo.notes ? '<span class="todo-has-notes">📝</span>' : ''}
            <span class="todo-project-badge">${this.getProjectName(todo.projectId)}</span>
          </div>
        </div>
        <div class="todo-actions">
          <button class="edit-todo" data-id="${todo.id}">Edit</button>
          <button class="delete-todo" data-id="${todo.id}">Delete</button>
        </div>
      </div>
    `;
  }

  handleDragStart(e, todoId) {
    const todo = this.currentProject.getTodo(todoId);
    this.draggedTodo = {
      id: todoId,
      sourceProjectId: this.currentProject.id,
      element: e.target,
      todo: todo
    };
    
    const dragImage = this.dragDropHelper.createDragImage(e.target, todo);
    e.dataTransfer.setDragImage(dragImage, 20, 20);
    e.dataTransfer.setData('text/plain', todoId);
    
    e.target.classList.add('dragging');
    e.dataTransfer.effectAllowed = 'move';
    
    // Clean up drag image after drag starts
    setTimeout(() => {
      document.body.removeChild(dragImage);
    }, 0);
  }

  handleDragEnd() {
    document.querySelectorAll('.card').forEach(card => {
      card.classList.remove('dragging', 'drag-over');
    });
    document.querySelectorAll('.project-item').forEach(item => {
      item.classList.remove('drag-over');
    });
    document.getElementById('container-Todo')?.classList.remove('drag-over');
    this.draggedTodo = null;
  }

  handleDropOnTodo(e, targetTodoId) {
    if (!this.draggedTodo) return;

    const sourceProject = this.projects.find(p => p.id === this.draggedTodo.sourceProjectId);
    const targetTodo = this.currentProject.getTodo(targetTodoId);
    const todosContainer = document.getElementById('container-Todo');
    
    if (sourceProject && targetTodo) {
      // Use helper to determine drop position
      const afterElement = this.dragDropHelper.getDragAfterElement(todosContainer, e.clientY);
      
      const draggedTodoIndex = sourceProject.todos.findIndex(t => t.id === this.draggedTodo.id);
      const targetTodoIndex = this.currentProject.todos.findIndex(t => t.id === targetTodoId);
      
      if (draggedTodoIndex !== -1 && targetTodoIndex !== -1) {
        // Remove from source
        const [movedTodo] = sourceProject.todos.splice(draggedTodoIndex, 1);
        
        // If moving between projects, update projectId
        if (sourceProject.id !== this.currentProject.id) {
          movedTodo.projectId = this.currentProject.id;
        }
        
        if (afterElement) {
          const afterId = afterElement.id.replace('todo-', '');
          const afterIndex = this.currentProject.todos.findIndex(t => t.id === afterId);
          this.currentProject.todos.splice(afterIndex + 1, 0, movedTodo);
        } else {
          this.currentProject.todos.splice(targetTodoIndex, 0, movedTodo);
        }
        
        if (sourceProject.id !== this.currentProject.id) {
          this.currentProject = this.projects.find(p => p.id === this.currentProject.id);
        }
        
        Storage.saveProjects(this.projects);
        this.render();
      }
    }
  }

  handleDropOnContainer(e) {
    if (!this.draggedTodo) return;

    const sourceProject = this.projects.find(p => p.id === this.draggedTodo.sourceProjectId);
    const todosContainer = document.getElementById('containerTodo');
    
    if (sourceProject) {
      const draggedTodoIndex = sourceProject.todos.findIndex(t => t.id === this.draggedTodo.id);
      
      if (draggedTodoIndex !== -1) {

        const afterElement = this.dragDropHelper.getDragAfterElement(todosContainer, e.clientY);
        

        const [movedTodo] = sourceProject.todos.splice(draggedTodoIndex, 1);
        

        if (sourceProject.id !== this.currentProject.id) {
          movedTodo.projectId = this.currentProject.id;
        }
        
      
        if (afterElement) {
          const afterId = afterElement.id.replace('todo-', '');
          const afterIndex = this.currentProject.todos.findIndex(t => t.id === afterId);
          this.currentProject.todos.splice(afterIndex + 1, 0, movedTodo);
        } else {

          this.currentProject.todos.push(movedTodo);
        }
        
        if (sourceProject.id !== this.currentProject.id) {
          this.currentProject = this.projects.find(p => p.id === this.currentProject.id);
        }
        
        Storage.saveProjects(this.projects);
        this.render();
      }
    }
  }

  handleDropOnProject(e, targetProjectId) {
    if (!this.draggedTodo) return;

    const sourceProject = this.projects.find(p => p.id === this.draggedTodo.sourceProjectId);
    const targetProject = this.projects.find(p => p.id === targetProjectId);
    
    if (sourceProject && targetProject && sourceProject.id !== targetProject.id) {
      const draggedTodoIndex = sourceProject.todos.findIndex(t => t.id === this.draggedTodo.id);
      
      if (draggedTodoIndex !== -1) {
        const [movedTodo] = sourceProject.todos.splice(draggedTodoIndex, 1);

        movedTodo.projectId = targetProject.id;
        
        targetProject.todos.push(movedTodo);
        
        if (this.currentProject.id === targetProject.id) {
          this.currentProject = targetProject;
        }
        
        Storage.saveProjects(this.projects);
        this.render();
      }
    }
  }

  getProjectName(projectId) {
    const project = this.projects.find(p => p.id === projectId);
    return project ? project.name : 'Unknown';
  }

  showProjectModal(projectId = null) {
    this.currentEditingProject = projectId ? 
      this.projects.find(p => p.id === projectId) : null;
    
    document.getElementById('project-modal-title').textContent = 
      this.currentEditingProject ? 'Edit Project' : 'New Project';
    
    document.getElementById('project-name').value = 
      this.currentEditingProject?.name || '';
    document.getElementById('project-description').value = 
      this.currentEditingProject?.description || '';
    
    this.projectModal.style.display = 'block';
  }

  showTodoModal(todoId = null) {
    this.currentEditingTodo = todoId ? 
      this.currentProject.getTodo(todoId) : null;
    
    document.getElementById('modal-title').textContent = 
      this.currentEditingTodo ? 'Edit Task' : 'New Task';
    
    // Populate form
    document.getElementById('title').value = 
      this.currentEditingTodo?.title || '';
    document.getElementById('description').value = 
      this.currentEditingTodo?.description || '';
    document.getElementById('due-date').value = 
      this.currentEditingTodo?.dueDate?.split('T')[0] || '';
    document.getElementById('priority').value = 
      this.currentEditingTodo?.priority || 'medium';
    document.getElementById('notes').value = 
      this.currentEditingTodo?.notes || '';
    
    // Populate project selector
    const projectSelect = document.getElementById('project');
    projectSelect.innerHTML = this.projects.map(project => `
      <option value="${project.id}" ${project.id === this.currentProject?.id ? 'selected' : ''}>
        ${project.name}
      </option>
    `).join('');
    
    this.todoModal.style.display = 'block';
  }

  handleProjectSubmit(e) {
    e.preventDefault();
    
    const name = document.getElementById('project-name').value;
    const description = document.getElementById('project-description').value;
    
    if (this.currentEditingProject) {
      // Edit existing project
      this.currentEditingProject.name = name;
      this.currentEditingProject.description = description;
    } else {
      // Create new project
      const newProject = new Project(name, description);
      this.projects.push(newProject);
    }
    
    Storage.saveProjects(this.projects);
    this.closeModals();
    this.render();
  }

  handleTodoSubmit(e) {
    e.preventDefault();
    
    const title = document.getElementById('title').value;
    const description = document.getElementById('description').value;
    const dueDate = document.getElementById('due-date').value;
    const priority = document.getElementById('priority').value;
    const notes = document.getElementById('notes').value;
    const projectId = document.getElementById('project').value;
    
    const targetProject = this.projects.find(p => p.id === projectId);
    
    if (this.currentEditingTodo) {
      // Edit existing todo
      this.currentEditingTodo.updateDetails({
        title,
        description,
        dueDate,
        priority,
        notes,
        projectId
      });
      
      // Move todo to different project if needed
      if (projectId !== this.currentProject.id) {
        this.currentProject.removeTodo(this.currentEditingTodo.id);
        targetProject.addTodo(this.currentEditingTodo);
        this.currentProject = targetProject;
      }
    } else {
      // Create new todo
      const newTodo = new Todo(title, description, dueDate, priority, notes, projectId);
      targetProject.addTodo(newTodo);
    }
    
    Storage.saveProjects(this.projects);
    this.closeModals();
    this.render();
  }

  selectProject(projectId) {
    this.currentProject = this.projects.find(p => p.id === projectId);
    this.render();
  }

  deleteProject(projectId) {
    if (confirm('Are you sure you want to delete this project and all its todos?')) {
      this.projects = this.projects.filter(p => p.id !== projectId);
      if (this.currentProject?.id === projectId) {
        this.currentProject = this.projects[0] || null;
      }
      Storage.saveProjects(this.projects);
      this.render();
    }
  }

  editProject(projectId) {
    this.showProjectModal(projectId);
  }

  deleteTodo(todoId) {
    if (confirm('Confirm you want to delete this Todo')) {
      this.currentProject.removeTodo(todoId);
      Storage.saveProjects(this.projects);
      this.render();
    }
  }

  editTodo(todoId) {
    this.showTodoModal(todoId);
  }

  toggleTodoComplete(todoId) {
    const todo = this.currentProject.getTodo(todoId);
    if (todo) {
      todo.toggleComplete();
      Storage.saveProjects(this.projects);
      this.render();
    }
  }

  setFilter(filter) {
    this.currentFilter = filter;
    
    document.querySelectorAll('.filter-btn').forEach(btn => {
      btn.classList.remove('active');
    });
    
    switch(filter) {
      case 'all':
        this.filterAll.classList.add('active');
        break;
      case 'today':
        this.filterToday.classList.add('active');
        break;
      case 'week':
        this.filterWeek.classList.add('active');
        break;
    }
    
    this.render();
  }

  closeModals() {
    this.projectModal.style.display = 'none';
    this.todoModal.style.display = 'none';
    this.currentEditingProject = null;
    this.currentEditingTodo = null;
  }
}
