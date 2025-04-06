"use client"
import React, { useState } from 'react';

interface EditableSpanProps {
  span: string;
  onChange: (newValue: string) => void; // Колбэк для передачи нового значения родителю
  className?: string; // Добавляем опциональный параметр для стилей
}

const EditableSpan: React.FC<EditableSpanProps> = ({ 
  span, 
  onChange,
  className = "" // Значение по умолчанию - пустая строка
}) => {
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState(span); // Инициализируем начальным значением

  const handleDoubleClick = () => {
    setTitle(span); // Сбрасываем значение к оригиналу при входе в режим редактирования
    setEditing(true);
  };


  const handleBlur = () => {
    setEditing(false);
    // Вызываем onChange только если значение изменилось
    if (title !== span && onChange) {
      onChange(title);
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      // При нажатии Enter сохраняем изменения
      if (title !== span && onChange) {
        onChange(title);
      }
      setEditing(false);
    } else if (event.key === 'Escape') {
      // При Escape отменяем редактирование
      setTitle(span);
      setEditing(false);
    }
  };

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setTitle(event.target.value);
  };
  return (
    <div className="inline-block">
      {editing ? (
        <input
          type="text"
          className="border-2 border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-700 rounded-md px-2 py-1 text-gray-800 placeholder-gray-500"
          value={title}
          onChange={handleInputChange}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          autoFocus
        />
      ) : (
        <span 
          className={`cursor-pointer hover:bg-gray-100 px-2 py-1 rounded ${className}`}
          onDoubleClick={handleDoubleClick}
        >
          {span}
        </span>
      )}
    </div>
  );
};

export default EditableSpan;