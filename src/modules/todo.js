// src/modules/todo.js
import { format, isToday, isThisWeek, isBefore, parseISO } from "date-fns";

export class Todo {
  constructor(
    title,
    description,
    dueDate,
    priority,
    notes,
    projectId = "default",
  ) {
    this.id = Date.now().toString();
    this.title = title;
    this.description = description || "";
    this.dueDate = dueDate;
    this.priority = priority || "medium";
    this.notes = notes || "";
    this.projectId = projectId;
    this.completed = false;
    this.createdAt = new Date().toISOString();
  }

  toggleComplete() {
    this.completed = !this.completed;
  }

  updateDetails({ title, description, dueDate, priority, notes, projectId }) {
    if (title) this.title = title;
    if (description !== undefined) this.description = description;
    if (dueDate) this.dueDate = dueDate;
    if (priority) this.priority = priority;
    if (notes !== undefined) this.notes = notes;
    if (projectId) this.projectId = projectId;
  }

  getFormattedDueDate() {
    return format(parseISO(this.dueDate), "PPP");
  }

  isOverdue() {
    return !this.completed && isBefore(parseISO(this.dueDate), new Date());
  }

  isDueToday() {
    return isToday(parseISO(this.dueDate));
  }

  isDueThisWeek() {
    return isThisWeek(parseISO(this.dueDate));
  }

  getPriorityClass() {
    const priorityClasses = {
      low: "priority-low",
      medium: "priority-medium",
      high: "priority-high",
    };
    return priorityClasses[this.priority] || "priority-medium";
  }
}
