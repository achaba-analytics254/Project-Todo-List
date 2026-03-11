export class Project {
  constructor(name, description = '') {
    this.id = Date.now().toString() + Math.random().toString(36).substr(2, 5);
    this.name = name;
    this.description = description;
    this.todos = [];
    this.createdAt = new Date().toISOString();
  }

  addTodo(todo) {
    this.todos.push(todo);
  }

  removeTodo(todoId) {
    const index = this.todos.findIndex(todo => todo.id === todoId);
    if (index !== -1) {
      this.todos.splice(index, 1);
    }
  }

  getTodo(todoId) {
    return this.todos.find(todo => todo.id === todoId);
  }

  getAllTodos() {
    return [...this.todos];
  }

  getCompletedTodos() {
    return this.todos.filter(todo => todo.completed);
  }

  getIncompleteTodos() {
    return this.todos.filter(todo => !todo.completed);
  }

  sortByPriority() {
    const priorityOrder = { high: 1, medium: 2, low: 3 };
    return [...this.todos].sort((a, b) => 
      priorityOrder[a.priority] - priorityOrder[b.priority]
    );
  }

  sortByDueDate() {
    return [...this.todos].sort((a, b) => 
      new Date(a.dueDate) - new Date(b.dueDate)
    );
  }
}