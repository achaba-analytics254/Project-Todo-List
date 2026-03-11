import { Project } from './project.js';
import { Todo } from './todo.js';

export class Storage {
  static saveProjects(projects) {
    const projectsData = projects.map(project => ({
      id: project.id,
      name: project.name,
      description: project.description,
      todos: project.todos.map(todo => ({
        id: todo.id,
        title: todo.title,
        description: todo.description,
        dueDate: todo.dueDate,
        priority: todo.priority,
        notes: todo.notes,
        projectId: todo.projectId,
        completed: todo.completed,
        createdAt: todo.createdAt,
      })),
      createdAt: project.createdAt,
    }));
    localStorage.setItem('todoProjects', JSON.stringify(projectsData));
  }

  static loadProjects() {
    const projectsData = localStorage.getItem('todoProjects');
    if (!projectsData) {
      const defaultProject = new Project('Default Project', 'Your default todo list');
      this.saveProjects([defaultProject]);
      return [defaultProject];
    }

    const parsedData = JSON.parse(projectsData);
    return parsedData.map(projectData => {
      const project = new Project(projectData.name, projectData.description);
      project.id = projectData.id;
      project.createdAt = projectData.createdAt;
      
      projectData.todos.forEach(todoData => {
        const todo = new Todo(
          todoData.title,
          todoData.description,
          todoData.dueDate,
          todoData.priority,
          todoData.notes,
          todoData.projectId
        );
        todo.id = todoData.id;
        todo.completed = todoData.completed;
        todo.createdAt = todoData.createdAt;
        project.addTodo(todo);
      });
      
      return project;
    });
  }

  static clearAll() {
    localStorage.removeItem('todoProjects');
  }
}