class TodoApp {
    constructor() {
        // DOM 元素
        this.todoInput = document.getElementById('todoInput');
        this.addBtn = document.getElementById('addBtn');
        this.todoList = document.getElementById('todoList');
        this.taskCount = document.getElementById('taskCount');
        this.clearCompletedBtn = document.getElementById('clearCompleted');
        this.filterBtns = document.querySelectorAll('.filter-btn');

        // 状态
        this.todos = JSON.parse(localStorage.getItem('todos')) || [];
        this.currentFilter = 'all';

        // 初始化
        this.init();
    }

    init() {
        // 绑定事件
        this.addBtn.addEventListener('click', () => this.addTodo());
        this.todoInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.addTodo();
        });
        this.clearCompletedBtn.addEventListener('click', () => this.clearCompleted());

        this.filterBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                this.filterBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.currentFilter = btn.dataset.filter;
                this.render();
            });
        });

        // 初始渲染
        this.render();
    }

    // 添加待办事项
    addTodo() {
        const text = this.todoInput.value.trim();
        if (!text) return;

        const todo = {
            id: Date.now(),
            text: text,
            completed: false,
            createdAt: new Date().toISOString()
        };

        this.todos.unshift(todo);
        this.saveTodos();
        this.render();

        this.todoInput.value = '';
        this.todoInput.focus();
    }

    // 切换完成状态
    toggleTodo(id) {
        const todo = this.todos.find(t => t.id === id);
        if (todo) {
            todo.completed = !todo.completed;
            this.saveTodos();
            this.render();
        }
    }

    // 删除待办事项
    deleteTodo(id) {
        this.todos = this.todos.filter(t => t.id !== id);
        this.saveTodos();
        this.render();
    }

    // 清除已完成的任务
    clearCompleted() {
        this.todos = this.todos.filter(t => !t.completed);
        this.saveTodos();
        this.render();
    }

    // 保存到 localStorage
    saveTodos() {
        localStorage.setItem('todos', JSON.stringify(this.todos));
    }

    // 获取过滤后的列表
    getFilteredTodos() {
        switch (this.currentFilter) {
            case 'active':
                return this.todos.filter(t => !t.completed);
            case 'completed':
                return this.todos.filter(t => t.completed);
            default:
                return this.todos;
        }
    }

    // 渲染列表
    render() {
        const filteredTodos = this.getFilteredTodos();

        // 清空列表
        this.todoList.innerHTML = '';

        // 渲染每个待办项
        filteredTodos.forEach(todo => {
            const li = document.createElement('li');
            li.className = `todo-item ${todo.completed ? 'completed' : ''}`;
            li.innerHTML = `
                <input
                    type="checkbox"
                    class="todo-checkbox"
                    ${todo.completed ? 'checked' : ''}
                >
                <span class="todo-text">${this.escapeHtml(todo.text)}</span>
                <button class="delete-btn">Delete</button>
            `;

            // 绑定事件
            li.querySelector('.todo-checkbox').addEventListener(
                'click',
                () => this.toggleTodo(todo.id)
            );
            li.querySelector('.delete-btn').addEventListener(
                'click',
                () => this.deleteTodo(todo.id)
            );

            this.todoList.appendChild(li);
        });

        // 更新统计
        this.updateStats();
    }

    // 更新统计数据
    updateStats() {
        const total = this.todos.length;
        const active = this.todos.filter(t => !t.completed).length;
        const completed = total - active;

        let statsText = `${total} task${total !== 1 ? 's' : ''}`;
        if (active > 0 || completed > 0) {
            statsText += ` (${active} active, ${completed} completed)`;
        }
        this.taskCount.textContent = statsText;

        // 显示/隐藏清除按钮
        this.clearCompletedBtn.style.display =
            completed > 0 ? 'block' : 'none';
    }

    // 防止 XSS 攻击
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

// 页面加载完成后初始化应用
document.addEventListener('DOMContentLoaded', () => {
    new TodoApp();
});
