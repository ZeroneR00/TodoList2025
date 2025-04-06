"use client"

import { useState, useEffect, KeyboardEvent } from "react";
import EditableSpan from "./EditableSpan";
import { DragDropContext, Droppable, Draggable, DropResult } from "@hello-pangea/dnd";

interface Task {
  id: number;
  text: string;
  completed: boolean;
  listId: number;
}

interface List {
  id: number;
  title: string;
  theme: string;
  tasks: Task[];
}

const TodoLists = () => {
    const [todoLists, setTodoLists] = useState<List[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [newListTitle, setNewListTitle] = useState("");
    const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
    const [newTaskText, setNewTaskText] = useState("");
    const [currentListId, setCurrentListId] = useState<number | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetchLists();
    }, []);

    const fetchLists = async () => {
        try {
            const response = await fetch('/api/lists');
            if (!response.ok) throw new Error('Failed to fetch lists');
            const data = await response.json();
            setTodoLists(data);
            setIsLoading(false);
        } catch (error) {
            console.error('Error fetching lists:', error);
            setIsLoading(false);
        }
    };

    const onChangeListTitle = async (id: number, newTitle: string) => {
        try {
            const response = await fetch(`/api/lists/${id}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ title: newTitle }),
            });

            if (!response.ok) throw new Error('Failed to update list');
            
            setTodoLists(todoLists.map(list => 
                list.id === id ? { ...list, title: newTitle } : list
            ));
        } catch (error) {
            console.error('Error updating list:', error);
        }
    };

    const openAddListModal = () => {
        setNewListTitle("");
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setNewListTitle("");
    };

    const openAddTaskModal = (listId: number) => {
        setNewTaskText("");
        setCurrentListId(listId);
        setIsTaskModalOpen(true);
    };

    const closeTaskModal = () => {
        setIsTaskModalOpen(false);
        setNewTaskText("");
        setCurrentListId(null);
    };

    const addList = async () => {
        if (newListTitle.trim() === "") {
            alert("Пожалуйста, введите название списка");
            return;
        }

        try {
            const response = await fetch('/api/lists', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    title: newListTitle,
                    theme: ["blue", "green", "purple", "red", "orange"][Math.floor(Math.random() * 5)]
                }),
            });

            if (!response.ok) throw new Error('Failed to create list');
            
            const newList = await response.json();
            setTodoLists([...todoLists, newList]);
            closeModal();
        } catch (error) {
            console.error('Error creating list:', error);
        }
    };

    const removeList = async (id: number) => {
        if (window.confirm("Вы уверены, что хотите удалить этот список?")) {
            try {
                const response = await fetch(`/api/lists/${id}`, {
                    method: 'DELETE',
                });

                if (!response.ok) throw new Error('Failed to delete list');
                
                setTodoLists(todoLists.filter(list => list.id !== id));
            } catch (error) {
                console.error('Error deleting list:', error);
            }
        }
    };

    const addTask = async () => {
        if (newTaskText.trim() === "" || currentListId === null) {
            alert("Пожалуйста, введите текст задачи");
            return;
        }

        try {
            const response = await fetch('/api/tasks', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    text: newTaskText,
                    listId: currentListId
                }),
            });

            if (!response.ok) throw new Error('Failed to create task');
            
            const newTask = await response.json();
            setTodoLists(todoLists.map(list =>
                list.id === currentListId
                    ? { ...list, tasks: [...list.tasks, newTask] }
                    : list
            ));
            closeTaskModal();
        } catch (error) {
            console.error('Error creating task:', error);
        }
    };

    const removeTask = async (taskId: number) => {
        if (window.confirm("Вы уверены, что хотите удалить эту задачу?")) {
            try {
                const response = await fetch(`/api/tasks/${taskId}`, {
                    method: 'DELETE',
                });

                if (!response.ok) throw new Error('Failed to delete task');
                
                setTodoLists(todoLists.map(list => ({
                    ...list,
                    tasks: list.tasks.filter(task => task.id !== taskId)
                })));
            } catch (error) {
                console.error('Error deleting task:', error);
            }
        }
    };

    const toggleTaskStatus = async (taskId: number) => {
        const task = todoLists.flatMap(list => list.tasks).find(t => t.id === taskId);
        if (!task) return;

        try {
            const response = await fetch(`/api/tasks/${taskId}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    completed: !task.completed
                }),
            });

            if (!response.ok) throw new Error('Failed to update task');
            
            setTodoLists(todoLists.map(list => ({
                ...list,
                tasks: list.tasks.map(t =>
                    t.id === taskId ? { ...t, completed: !t.completed } : t
                )
            })));
        } catch (error) {
            console.error('Error updating task:', error);
        }
    };

    const updateTask = async (taskId: number, newText: string) => {
        try {
            const response = await fetch(`/api/tasks/${taskId}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ text: newText }),
            });

            if (!response.ok) throw new Error('Failed to update task');
            
            setTodoLists(todoLists.map(list => ({
        ...list,
                tasks: list.tasks.map(task =>
                    task.id === taskId ? { ...task, text: newText } : task
                )
            })));
        } catch (error) {
            console.error('Error updating task:', error);
        }
    };

    const onDragEnd = async (result: DropResult) => {
        if (!result.destination) return;

        if (result.destination.droppableId === result.source.droppableId &&
            result.destination.index === result.source.index) {
            return;
        }

        if (result.type === "task") {
            const sourceListId = parseInt(result.source.droppableId);
            const destListId = parseInt(result.destination.droppableId);
            
            const allTasks = todoLists.flatMap(list => list.tasks);
            const sourceTasks = allTasks.filter(task => task.listId === sourceListId);
            const taskToMove = sourceTasks[result.source.index];
            
            if (!taskToMove) return;

            try {
                if (sourceListId !== destListId) {
                    // Обновляем listId задачи в базе данных
                    const response = await fetch(`/api/tasks/${taskToMove.id}`, {
                        method: 'PATCH',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({ listId: destListId }),
                    });

                    if (!response.ok) throw new Error('Failed to update task list');
                }

                if (sourceListId === destListId) {
                    const newSourceTasks = Array.from(sourceTasks);
                    newSourceTasks.splice(result.source.index, 1);
                    newSourceTasks.splice(result.destination.index, 0, taskToMove);
                    
                    setTodoLists(todoLists.map(list => ({
                        ...list,
                        tasks: list.id === sourceListId ? newSourceTasks : list.tasks
                    })));
                } else {
                    const destTasks = allTasks.filter(task => task.listId === destListId);
                    const newSourceTasks = sourceTasks.filter((_, index) => index !== result.source.index);
                    const newDestTasks = Array.from(destTasks);
                    newDestTasks.splice(result.destination.index, 0, { ...taskToMove, listId: destListId });
                    
                    setTodoLists(todoLists.map(list => {
                        if (list.id === sourceListId) {
                            return { ...list, tasks: newSourceTasks };
                        }
                        if (list.id === destListId) {
                            return { ...list, tasks: newDestTasks };
                        }
                        return list;
                    }));
                }
            } catch (error) {
                console.error('Error updating task position:', error);
            }
        }
    };

    const handleListKeyPress = (e: KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            addList();
        }
    };

    const handleTaskKeyPress = (e: KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            addTask();
        }
    };

    return (
        <div>
            {isLoading ? (
                <div className="max-w-5xl mx-auto p-8 text-center ">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
                </div>
            ) : todoLists.length === 0 ? (
                <div className="max-w-5xl mx-auto p-8 text-center ">
                    <h1 className="text-3xl font-bold text-gray-800 mb-6">Мои списки задач</h1>
                    <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-200">
                        <p className="text-gray-600 mb-4">У вас пока нет ни одного списка задач.</p>
                        <button 
                            className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-4 rounded transition-colors"
                            onClick={openAddListModal}
                        >
                            + Создать первый список
                        </button>
                    </div>
                </div>
            ) : (
                <div className="h-screen bg-[#f1f2f4] overflow-hidden">
                    <div className="flex flex-col h-full">
                        <div className="px-6 py-4 bg-white shadow-sm">
                            <div className="flex justify-between items-center max-w-7xl mx-auto">
                                <h1 className="text-xl font-semibold text-gray-900">Мои списки задач</h1>
                                <button 
                                    className="trello-button"
                                    onClick={openAddListModal}
                                >
                                    + Новый список
                                </button>
                            </div>
                        </div>

                        <div className="flex-1 overflow-x-auto overflow-y-hidden px-6 py-4">
                            <DragDropContext onDragEnd={onDragEnd}>
                                <div className="flex gap-4" style={{ height: 'calc(100vh - 120px)' }}>
                                    {todoLists.map((list) => (
                                        <div 
                                            key={list.id}
                                            className="trello-list"
                                        >
                                            <div className="px-3 py-2 flex justify-between items-center">
                                                <EditableSpan 
                                                    span={list.title} 
                                                    onChange={(newValue) => onChangeListTitle(list.id, newValue)} 
                                                    className="text-lg font-bold text-gray-800"
                                                />
                                                <button 
                                                    className="text-gray-500 hover:text-gray-700 transition-colors p-1 rounded hover:bg-gray-200"
                                                    onClick={() => removeList(list.id)}
                                                    title="Удалить список"
                                                >
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                                        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                                                    </svg>
                                                </button>
                                            </div>

                                            <Droppable droppableId={`${list.id}`} type="task">
                                                {(provided) => (
                                                    <div
                                                        ref={provided.innerRef}
                                                        {...provided.droppableProps}
                                                        className="px-1 pb-1 overflow-y-auto"
                                                        style={{ maxHeight: 'calc(100% - 40px)' }}
                                                    >
                                                        {list.tasks.length === 0 ? (
                                                            <p className="text-gray-500 text-sm p-2">Нет задач в этом списке</p>
                                                        ) : (
                                                            <ul className="space-y-2">
                                                                {list.tasks.map((task, index) => (
                                                                    <Draggable key={task.id} draggableId={`task-${task.id}`} index={index}>
                                                                        {(provided, snapshot) => (
                                                                            <li
                                                                                ref={provided.innerRef}
                                                                                {...provided.draggableProps}
                                                                                {...provided.dragHandleProps}
                                                                                className={`trello-card ${
                                                                                    snapshot.isDragging ? 'shadow-md' : ''
                                                                                }`}
                                                                            >
                                                                                <div className="flex items-center gap-2">
                                                                                    <input 
                                                                                        type="checkbox" 
                                                                                        checked={task.completed}
                                                                                        onChange={() => toggleTaskStatus(task.id)}
                                                                                        className="h-4 w-4 text-trello-blue rounded border-gray-300 focus:ring-trello-blue"
                                                                                    />
                                                                                    <EditableSpan 
                                                                                        span={task.text} 
                                                                                        onChange={(newValue) => updateTask(task.id, newValue)} 
                                                                                    />
                                                                                    <button 
                                                                                        className="ml-auto text-gray-400 hover:text-gray-600 transition-colors"
                                                                                        onClick={() => removeTask(task.id)}
                                                                                    >
                                                                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                                                                            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                                                                                        </svg>
                                                                                    </button>
                                                                                </div>
                                                                            </li>
                                                                        )}
                                                                    </Draggable>
                                                                ))}
                                                                {provided.placeholder}
                                                            </ul>
                                                        )}
                                                        <button 
                                                            className="w-full text-left text-gray-600 hover:bg-gray-200 rounded mt-2 p-2 text-sm"
                                                            onClick={() => openAddTaskModal(list.id)}
                                                        >
                                                            + Добавить задачу
                                                        </button>
                                                    </div>
                                                )}
                                            </Droppable>
                                        </div>
                                    ))}
                                </div>
                            </DragDropContext>
                        </div>
                    </div>
                </div>
            )}

            {/* Модальное окно для добавления нового списка */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white p-6 rounded-lg shadow-lg w-96">
                        <h2 className="text-xl font-bold mb-4 text-gray-800">Создать новый список</h2>
                        <input
                            type="text"
                            className="w-full border border-gray-300 rounded p-2 mb-4 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            placeholder="Введите название списка"
                            value={newListTitle}
                            onChange={(e) => setNewListTitle(e.target.value)}
                            onKeyPress={handleListKeyPress}
                            autoFocus
                        />
                        <div className="flex justify-end space-x-2">
                            <button
                                className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-2 px-4 rounded transition-colors"
                                onClick={closeModal}
                            >
                                Отмена
                            </button>
                            <button
                                className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-4 rounded transition-colors"
                                onClick={addList}
                            >
                                Создать
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Модальное окно для добавления новой задачи */}
            {isTaskModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white p-6 rounded-lg shadow-lg w-96">
                        <h2 className="text-xl font-bold mb-4 text-gray-800">Добавить новую задачу</h2>
                        <input
                            type="text"
                            className="w-full border border-gray-300 rounded p-2 mb-4 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            placeholder="Введите текст задачи"
                            value={newTaskText}
                            onChange={(e) => setNewTaskText(e.target.value)}
                            onKeyPress={handleTaskKeyPress}
                            autoFocus
                        />
                        <div className="flex justify-end space-x-2">
                            <button
                                className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-2 px-4 rounded transition-colors"
                                onClick={closeTaskModal}
                            >
                                Отмена
                            </button>
                            <button
                                className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-4 rounded transition-colors"
                                onClick={addTask}
                            >
                                Добавить
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TodoLists;