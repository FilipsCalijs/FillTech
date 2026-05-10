import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import Underline from '@tiptap/extension-underline';
import Placeholder from '@tiptap/extension-placeholder';
import TextAlign from '@tiptap/extension-text-align';
import Image from '@tiptap/extension-image';
import { useRef, useState } from 'react';
import axios from 'axios';
import {
  Bold, Italic, Underline as UnderlineIcon, Strikethrough,
  Link as LinkIcon, Unlink,
  List, ListOrdered, Quote, Minus, Code, CodeSquare,
  Heading2, Heading3,
  AlignLeft, AlignCenter, AlignRight, AlignJustify,
  Undo, Redo,
  ImagePlus, Loader2,
} from 'lucide-react';

const API = 'http://localhost:5200';

// ─── Кнопка тулбара ───────────────────────────────────────────
const Btn = ({ onClick, active, disabled, title, children }) => (
  <button
    type="button"
    onMouseDown={(e) => { e.preventDefault(); onClick(); }}
    disabled={disabled}
    title={title}
    className={`p-1.5 rounded transition-colors select-none ${
      active
        ? 'bg-primary text-primary-foreground'
        : 'text-muted-foreground hover:text-foreground hover:bg-muted'
    } ${disabled ? 'opacity-35 cursor-not-allowed' : ''}`}
  >
    {children}
  </button>
);

const Sep = () => <div className="w-px h-5 bg-border mx-1 shrink-0 self-center" />;

// ─── Редактор ─────────────────────────────────────────────────
const RichEditor = ({ value, onChange, placeholder = 'Текст поста...' }) => {
  const fileRef = useRef(null);
  const [uploading, setUploading] = useState(false);

  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      Image.configure({ inline: false, allowBase64: false }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: { class: 'text-primary underline cursor-pointer' },
      }),
      Placeholder.configure({ placeholder }),
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
    ],
    content: value || '',
    onUpdate({ editor }) {
      onChange(editor.getHTML());
    },
  });

  if (!editor) return null;

  // ── Ссылка ──────────────────────────────────────────────────
  const handleLink = () => {
    const prev = editor.getAttributes('link').href || '';
    const url = window.prompt('URL ссылки', prev);
    if (url === null) return;
    url === ''
      ? editor.chain().focus().unsetLink().run()
      : editor.chain().focus().setLink({ href: url, target: '_blank' }).run();
  };

  // ── Загрузка картинки с компьютера ──────────────────────────
  const handleImageFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = '';

    setUploading(true);
    try {
      const fd = new FormData();
      fd.append('file', file);
      const uid = localStorage.getItem('userUID') || '';
      const { data } = await axios.post(`${API}/api/media/upload`, fd, {
        headers: { 'x-user-uid': uid, 'Content-Type': 'multipart/form-data' },
      });
      editor.chain().focus().setImage({ src: data.url, alt: file.name }).run();
    } catch {
      alert('Ошибка загрузки изображения');
    } finally {
      setUploading(false);
    }
  };

  // ── Вставка картинки по URL ──────────────────────────────────
  const handleImageUrl = () => {
    const url = window.prompt('URL изображения');
    if (url) editor.chain().focus().setImage({ src: url }).run();
  };

  return (
    <div className="flex flex-col border border-border rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-ring bg-card">

      {/* ── Тулбар ── */}
      <div className="flex flex-wrap items-center gap-0.5 px-3 py-2 border-b border-border bg-muted/30">

        {/* История */}
        <Btn title="Отменить (Ctrl+Z)" onClick={() => editor.chain().focus().undo().run()} disabled={!editor.can().undo()}>
          <Undo size={14} />
        </Btn>
        <Btn title="Повторить (Ctrl+Y)" onClick={() => editor.chain().focus().redo().run()} disabled={!editor.can().redo()}>
          <Redo size={14} />
        </Btn>

        <Sep />

        {/* Заголовки */}
        <Btn title="Заголовок H2" active={editor.isActive('heading', { level: 2 })} onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}>
          <Heading2 size={14} />
        </Btn>
        <Btn title="Заголовок H3" active={editor.isActive('heading', { level: 3 })} onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}>
          <Heading3 size={14} />
        </Btn>

        <Sep />

        {/* Форматирование текста */}
        <Btn title="Жирный (Ctrl+B)" active={editor.isActive('bold')} onClick={() => editor.chain().focus().toggleBold().run()}>
          <Bold size={14} />
        </Btn>
        <Btn title="Курсив (Ctrl+I)" active={editor.isActive('italic')} onClick={() => editor.chain().focus().toggleItalic().run()}>
          <Italic size={14} />
        </Btn>
        <Btn title="Подчёркнутый (Ctrl+U)" active={editor.isActive('underline')} onClick={() => editor.chain().focus().toggleUnderline().run()}>
          <UnderlineIcon size={14} />
        </Btn>
        <Btn title="Зачёркнутый" active={editor.isActive('strike')} onClick={() => editor.chain().focus().toggleStrike().run()}>
          <Strikethrough size={14} />
        </Btn>
        <Btn title="Код" active={editor.isActive('code')} onClick={() => editor.chain().focus().toggleCode().run()}>
          <Code size={14} />
        </Btn>

        <Sep />

        {/* Ссылки */}
        <Btn title="Добавить ссылку" active={editor.isActive('link')} onClick={handleLink}>
          <LinkIcon size={14} />
        </Btn>
        <Btn title="Убрать ссылку" disabled={!editor.isActive('link')} onClick={() => editor.chain().focus().unsetLink().run()}>
          <Unlink size={14} />
        </Btn>

        <Sep />

        {/* Списки и блоки */}
        <Btn title="Маркированный список" active={editor.isActive('bulletList')} onClick={() => editor.chain().focus().toggleBulletList().run()}>
          <List size={14} />
        </Btn>
        <Btn title="Нумерованный список" active={editor.isActive('orderedList')} onClick={() => editor.chain().focus().toggleOrderedList().run()}>
          <ListOrdered size={14} />
        </Btn>
        <Btn title="Цитата" active={editor.isActive('blockquote')} onClick={() => editor.chain().focus().toggleBlockquote().run()}>
          <Quote size={14} />
        </Btn>
        <Btn title="Блок кода" active={editor.isActive('codeBlock')} onClick={() => editor.chain().focus().toggleCodeBlock().run()}>
          <CodeSquare size={14} />
        </Btn>
        <Btn title="Горизонтальная линия" onClick={() => editor.chain().focus().setHorizontalRule().run()}>
          <Minus size={14} />
        </Btn>

        <Sep />

        {/* Выравнивание */}
        <Btn title="По левому краю" active={editor.isActive({ textAlign: 'left' })} onClick={() => editor.chain().focus().setTextAlign('left').run()}>
          <AlignLeft size={14} />
        </Btn>
        <Btn title="По центру" active={editor.isActive({ textAlign: 'center' })} onClick={() => editor.chain().focus().setTextAlign('center').run()}>
          <AlignCenter size={14} />
        </Btn>
        <Btn title="По правому краю" active={editor.isActive({ textAlign: 'right' })} onClick={() => editor.chain().focus().setTextAlign('right').run()}>
          <AlignRight size={14} />
        </Btn>
        <Btn title="По ширине" active={editor.isActive({ textAlign: 'justify' })} onClick={() => editor.chain().focus().setTextAlign('justify').run()}>
          <AlignJustify size={14} />
        </Btn>

        <Sep />

        {/* Изображение */}
        <Btn
          title="Вставить изображение с компьютера"
          disabled={uploading}
          onClick={() => fileRef.current?.click()}
        >
          {uploading ? <Loader2 size={14} className="animate-spin" /> : <ImagePlus size={14} />}
        </Btn>
        <Btn title="Вставить изображение по URL" onClick={handleImageUrl}>
          <span className="text-[10px] font-mono font-bold leading-none px-0.5">URL</span>
        </Btn>

        {/* Скрытый file input */}
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleImageFile}
        />
      </div>

      {/* ── Область редактирования ── */}
      <EditorContent
        editor={editor}
        className="rich-editor min-h-[450px] px-6 py-4 text-foreground focus:outline-none"
      />
    </div>
  );
};

export default RichEditor;


