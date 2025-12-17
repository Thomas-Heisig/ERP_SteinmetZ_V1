// SPDX-License-Identifier: MIT
// apps/frontend/src/components/ui/Input.examples.tsx

/**
 * @module Input Examples
 * @description Usage examples for the Input component
 */

import React from "react";
import { Input } from "./Input";
import styles from "./Input.examples.module.css";

export const InputExamples: React.FC = () => {
  const [value, setValue] = React.useState("");

  return (
    <div className={styles.container}>
      <h1>Input Component Examples</h1>

      {/* Basic Input */}
      <section>
        <h2>Basic Input</h2>
        <Input
          label="Username"
          placeholder="Enter your username"
          value={value}
          onChange={(e) => setValue(e.target.value)}
        />
      </section>

      {/* Input with Error */}
      <section>
        <h2>Input with Error</h2>
        <Input
          label="Email"
          type="email"
          placeholder="name@example.com"
          error="Please enter a valid email address"
        />
      </section>

      {/* Input with Helper Text */}
      <section>
        <h2>Input with Helper Text</h2>
        <Input
          label="Password"
          type="password"
          helperText="Must be at least 8 characters long"
        />
      </section>

      {/* Required Input */}
      <section>
        <h2>Required Input</h2>
        <Input label="Full Name" required placeholder="John Doe" />
      </section>

      {/* Input with Left Icon */}
      <section>
        <h2>Input with Left Icon</h2>
        <Input
          label="Search"
          placeholder="Search..."
          icon={<span>🔍</span>}
          iconPosition="left"
        />
      </section>

      {/* Input with Right Icon */}
      <section>
        <h2>Input with Right Icon</h2>
        <Input
          label="Amount"
          type="number"
          placeholder="0.00"
          icon={<span>💰</span>}
          iconPosition="right"
        />
      </section>

      {/* Input with Suffix */}
      <section>
        <h2>Input with Suffix</h2>
        <Input label="Price" type="number" placeholder="0.00" suffix="EUR" />
      </section>

      {/* Disabled Input */}
      <section>
        <h2>Disabled Input</h2>
        <Input label="Disabled Field" value="Cannot edit this" disabled />
      </section>

      {/* Read-only Input */}
      <section>
        <h2>Read-only Input</h2>
        <Input label="Read-only Field" value="This is read-only" readOnly />
      </section>

      {/* Full Featured Example */}
      <section>
        <h2>Full Featured Input</h2>
        <Input
          label="Website URL"
          type="url"
          placeholder="https://example.com"
          helperText="Enter your company website"
          icon={<span>🌐</span>}
          iconPosition="left"
          required
        />
      </section>
    </div>
  );
};

export default InputExamples;
