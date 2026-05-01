# 🎨 UI/UX — DESIGN SYSTEM

## Color Palette

| Color | Hex | Usage |
|-------|-----|-------|
| Primary | #D36135 | Buttons, headers, accent elements |
| Secondary | #7FB069 | Status indicators, borders |
| Background | #ECE4B7 | Main page background |
| Accent | #E6AA68 | Hover states, highlights |
| Dark | #02020B | Text, headers |

## Typography

- **Font Family**: Google Sans
- **Headings**: 28px, bold (#02020B)
- **Subheadings**: 18px, semi-bold (#02020B)
- **Body Text**: 14px, regular (#02020B)
- **Labels**: 12px, medium (#02020B)

## Layout

### Page Structure
```
┌─────────────────────────────────────┐
│  Header: "Nexus Task Management"    │
├─────────────────────────────────────┤
│  [Add Task Button]                  │
├─────────────────────────────────────┤
│  To Do  │  In Progress  │  Done     │
│  ─────────────────────────────────  │
│  [Card]│  [Card]       │ [Card]    │
│  [Card]│  [Card]       │ [Card]    │
└─────────────────────────────────────┘
```

### Kanban Columns
- **Width**: Equal, responsive (1/3 each)
- **Height**: Full viewport (scrollable)
- **Background**: Slightly darker than main background
- **Border**: 1px solid secondary color

### Task Cards
- **Width**: Full column width minus padding
- **Height**: Auto (min 80px)
- **Padding**: 16px
- **Border Radius**: 8px
- **Background**: #ECE4B7 (light)
- **Shadow**: Subtle shadow on hover
- **Drag Opacity**: 0.5 when dragging

## Components

### Add Task Form
- **Input**: Title field (required)
- **Input**: Description field (optional)
- **Button**: "Add Task" (Primary color)
- **Layout**: Horizontal form with button

### Column Header
- **Title**: "To Do" / "In Progress" / "Done"
- **Color**: Primary color (#D36135)
- **Font**: 18px, bold
- **Icon**: Iconify icon for status

### Task Card
- **Title**: Bold text, #02020B
- **Description**: Regular text, lighter gray
- **Actions**: Delete button (Iconify icon)
- **Timestamps**: Small gray text (optional)
- **Hover Effect**: Slight shadow increase, accent color border

### Button Styles
- **Primary**: Background #D36135, text white, 8px border-radius
- **Hover**: Background #E6AA68
- **Active**: Darker shade of primary
- **Disabled**: Gray

## Responsive Design

- **Desktop**: 3 columns side-by-side
- **Tablet**: 3 columns, smaller padding
- **Mobile**: Single column scroll (future enhancement)

## Icons (Iconify)

- Plus Icon: `lucide:plus` (Add task)
- Trash Icon: `lucide:trash-2` (Delete task)
- Column Icons: `lucide:circle-plus`, `lucide:circle-dot`, `lucide:check-circle` (Status)

## Accessibility

- Sufficient color contrast (AA WCAG)
- Semantic HTML
- ARIA labels on buttons
- Keyboard navigation support (future)
