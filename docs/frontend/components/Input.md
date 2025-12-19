# Input Component

Accessible and feature-rich input component with label, error, helper text, icons, and suffix support.

## Features

- ✅ **Fully Accessible**: ARIA attributes, keyboard navigation, screen reader support
- 🎨 **Customizable**: CSS Modules with CSS variables for theming
- 🔒 **Type-Safe**: Full TypeScript support with comprehensive prop types
- 📱 **Responsive**: Works on all screen sizes
- 🎯 **Form Integration**: Compatible with form libraries (React Hook Form, Formik, etc.)
- 🌓 **Dark Mode**: Automatic dark mode support via CSS variables
- ♿ **WCAG Compliant**: Meets WCAG 2.1 Level AA standards

## Installation

The Input component is part of the UI component library:

```tsx
import { Input } from "@/components/ui";
```

## Basic Usage

```tsx
import { Input } from "@/components/ui";

function MyForm() {
  const [value, setValue] = useState("");

  return (
    <Input
      label="Username"
      value={value}
      onChange={(e) => setValue(e.target.value)}
      placeholder="Enter your username"
    />
  );
}
```

## Props

| Prop                   | Type                | Default  | Description                                       |
| ---------------------- | ------------------- | -------- | ------------------------------------------------- |
| `label`                | `string`            | -        | Label text displayed above the input              |
| `error`                | `string`            | -        | Error message displayed below the input           |
| `helperText`           | `string`            | -        | Helper text displayed below input when no error   |
| `icon`                 | `ReactNode`         | -        | Icon element to display                           |
| `iconPosition`         | `"left" \| "right"` | `"left"` | Position of the icon                              |
| `suffix`               | `ReactNode`         | -        | Suffix text/element (e.g., unit like "EUR", "kg") |
| `required`             | `boolean`           | `false`  | Shows asterisk (\*) next to label                 |
| All native input props | -                   | -        | Supports all HTML input attributes                |

## Examples

### Basic Input

```tsx
<Input label="Email" type="email" placeholder="name@example.com" />
```

### Input with Error

```tsx
<Input
  label="Password"
  type="password"
  error="Password must be at least 8 characters"
/>
```

### Input with Helper Text

```tsx
<Input
  label="Username"
  helperText="Choose a unique username"
  placeholder="john_doe"
/>
```

### Required Input

```tsx
<Input label="Full Name" required placeholder="John Doe" />
```

### Input with Icon

```tsx
import { Search } from "lucide-react";

<Input
  label="Search"
  icon={<Search size={20} />}
  iconPosition="left"
  placeholder="Search..."
/>;
```

### Input with Suffix

```tsx
<Input label="Price" type="number" suffix="EUR" placeholder="0.00" />
```

### Disabled Input

```tsx
<Input label="Read-only field" value="Cannot edit" disabled />
```

### With React Hook Form

```tsx
import { useForm } from "react-hook-form";
import { Input } from "@/components/ui";

function MyForm() {
  const {
    register,
    formState: { errors },
  } = useForm();

  return (
    <Input
      label="Email"
      type="email"
      error={errors.email?.message}
      {...register("email", {
        required: "Email is required",
        pattern: {
          value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
          message: "Invalid email address",
        },
      })}
    />
  );
}
```

## Accessibility

The Input component follows accessibility best practices:

- **Labels**: Every input has an associated label via `htmlFor`
- **ARIA Attributes**:
  - `aria-invalid`: Set to `true` when there's an error
  - `aria-describedby`: Links to error/helper text
  - `aria-required`: Indicates required fields
  - `aria-hidden`: Applied to decorative icons
- **Error Handling**: Errors use `role="alert"` for screen reader announcements
- **Keyboard Navigation**: Full keyboard support (Tab, Enter, Escape)
- **Focus Management**: Clear focus indicators

## Styling

The component uses CSS Modules with CSS variables for easy theming:

```css
/* Override in your theme */
:root {
  --input-bg: #ffffff;
  --input-bg-dark: #374151;
  --border: #d1d5db;
  --border-dark: #4b5563;
  --primary-500: #3b82f6;
  --error-500: #ef4444;
  --text-primary: #111827;
  --text-secondary: #6b7280;
  --text-tertiary: #9ca3af;
}
```

### Custom Styling

```tsx
<Input label="Custom styled" className="my-custom-input" />
```

```css
.my-custom-input {
  border-radius: 16px;
  font-size: 1.125rem;
}
```

## Browser Support

- Chrome/Edge (last 2 versions)
- Firefox (last 2 versions)
- Safari (last 2 versions)
- iOS Safari (last 2 versions)
- Chrome for Android (last 2 versions)

## TypeScript

The component exports full TypeScript types:

```tsx
import type { InputProps } from "@/components/ui";

const myInputProps: InputProps = {
  label: "Email",
  type: "email",
  required: true,
};
```

## Testing

```tsx
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Input } from "@/components/ui";

test("renders input with label", () => {
  render(<Input label="Username" />);
  expect(screen.getByLabelText("Username")).toBeInTheDocument();
});

test("shows error message", () => {
  render(<Input label="Email" error="Invalid email" />);
  expect(screen.getByRole("alert")).toHaveTextContent("Invalid email");
});

test("handles user input", async () => {
  const handleChange = jest.fn();
  render(<Input label="Name" onChange={handleChange} />);

  await userEvent.type(screen.getByLabelText("Name"), "John");
  expect(handleChange).toHaveBeenCalledTimes(4);
});
```

## Related Components

- [Button](./Button.md)
- [Select](./Select.md)
- [Form](./Form.md)
- [Modal](./Modal.md)

## Changelog

### v1.1.0 (Current)

- ✨ Added `suffix` prop for unit display
- ✨ Added `required` prop with visual indicator
- ✨ Improved accessibility with `aria-describedby`
- 🐛 Fixed ARIA boolean attribute handling
- 📚 Added comprehensive examples and documentation

### v1.0.0

- 🎉 Initial release
- ✅ Basic input functionality
- ✅ Label, error, and helper text support
- ✅ Icon positioning (left/right)
