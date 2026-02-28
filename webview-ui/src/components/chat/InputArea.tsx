import React, { useState, useRef, useCallback } from 'react';

interface InputAreaProps {
    onSend: (text: string) => void;
    disabled: boolean;
}

export const InputArea: React.FC<InputAreaProps> = ({ onSend, disabled }) => {
    const [text, setText] = useState('');
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    const handleSend = useCallback(() => {
        const trimmed = text.trim();
        if (!trimmed || disabled) return;
        onSend(trimmed);
        setText('');
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
        }
    }, [text, disabled, onSend]);

    const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    }, [handleSend]);

    const handleInput = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setText(e.target.value);
        // 自動リサイズ
        const ta = e.target;
        ta.style.height = 'auto';
        ta.style.height = `${Math.min(ta.scrollHeight, 120)}px`;
    }, []);

    return (
        <div className="input-area">
            <textarea
                ref={textareaRef}
                className="input-textarea"
                value={text}
                onChange={handleInput}
                onKeyDown={handleKeyDown}
                placeholder={disabled ? '処理中...' : 'メッセージを入力... (Enter で送信)'}
                disabled={disabled}
                rows={1}
            />
            <button
                className="send-button"
                onClick={handleSend}
                disabled={disabled || !text.trim()}
            >
                送信
            </button>
        </div>
    );
};
