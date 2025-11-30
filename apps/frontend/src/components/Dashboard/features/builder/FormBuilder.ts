// SPDX-License-Identifier: MIT
// src/components/Dashboard/features/builder/FormBuilder.ts

/**
 * FormBuilder – erzeugt Formularstrukturen basierend auf Node- oder Schema-Definitionen.
 * Der Builder enthält keine UI, sondern liefert rein logische Formmodelle.
 */

import type {
  FormField,
  DashboardNode,
  ValidationRule,
} from "../../types";

export interface BuiltFormField {
  id: string;
  type: FormField["type"];
  label: string;
  required: boolean;
  defaultValue?: any;
  options?: string[];
  validation: ValidationRule;
}

export interface BuiltForm {
  fields: BuiltFormField[];
  values: Record<string, any>;
  valid: boolean;
}

/**
 * FormBuilder – zentraler Builder für Formulare.
 */
export class FormBuilder {
  constructor() {}

  /**
   * Erzeugt ein Formular basierend auf einem DashboardNode.
   */
  fromNode(node: DashboardNode): BuiltForm {
    const fields = node.data.fields ?? [];
    return this.fromFieldList(fields);
  }

  /**
   * Wandelt FormField[] in ein vollständiges Formularmodell um.
   */
  fromFieldList(fieldList: FormField[]): BuiltForm {
    const built: BuiltFormField[] = [];
    const values: Record<string, unknown> = {};

    for (const f of fieldList) {
      built.push({
        id: f.id,
        type: f.type,
        label: f.label,
        required: f.required,
        defaultValue: f.defaultValue,
        options: f.options,
        validation: f.validation ?? {},
      });

      values[f.id] = f.defaultValue ?? null;
    }

    return {
      fields: built,
      values,
      valid: this.validateAll(built, values),
    };
  }

  /**
   * Validiert alle Felder eines Formulars.
   */
  validateAll(fields: BuiltFormField[], values: Record<string, any>): boolean {
    for (const field of fields) {
      if (!this.validateField(field, values[field.id])) {
        return false;
      }
    }
    return true;
  }

  /**
   * Validiert ein einzelnes Feld.
   */
  validateField(field: BuiltFormField, value: any): boolean {
    const rule = field.validation;

    if (field.required && (value === null || value === undefined || value === "")) {
      return false;
    }

    if (rule.pattern && typeof value === "string" && !rule.pattern.test(value)) {
      return false;
    }

    if (typeof value === "number") {
      if (rule.min !== undefined && value < rule.min) return false;
      if (rule.max !== undefined && value > rule.max) return false;
    }

    if (rule.custom && !rule.custom(value)) {
      return false;
    }

    return true;
  }

  /**
   * Setzt einen Formularwert und gibt ein neues Formmodell zurück.
   */
  updateValue(form: BuiltForm, fieldId: string, newValue: any): BuiltForm {
    const values = { ...form.values, [fieldId]: newValue };
    const valid = this.validateAll(form.fields, values);
    return { ...form, values, valid };
  }
}

export default FormBuilder;