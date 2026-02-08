use validator::{Validate, ValidationErrors, ValidationErrorsKind};

#[inline]
pub fn slice_up_to(s: &str, max_len: usize) -> &str {
    if max_len >= s.len() || s.is_empty() {
        return s;
    }

    let mut idx = max_len;
    while !s.is_char_boundary(idx) {
        idx -= 1;
    }

    &s[..idx]
}

#[inline]
pub fn validate_data<T: Validate>(data: &T) -> Result<(), Vec<String>> {
    if let Err(err) = data.validate() {
        let error_messages = flatten_validation_errors(&err, "");

        return Err(error_messages);
    }

    Ok(())
}

pub fn flatten_validation_errors(errors: &ValidationErrors, prefix: &str) -> Vec<String> {
    let mut messages = Vec::new();

    for (field, kind) in errors.errors() {
        let full_name = if prefix.is_empty() {
            field.to_string()
        } else {
            format!("{}.{}", prefix, field)
        };

        match kind {
            ValidationErrorsKind::Field(field_errors) => {
                for error in field_errors {
                    if let Some(message) = &error.message {
                        messages.push(format!("{full_name}: {message}"));
                    } else {
                        messages.push(format!("{full_name}: invalid {}", error.code));
                    }
                }
            }
            ValidationErrorsKind::Struct(nested_errors) => {
                messages.extend(flatten_validation_errors(nested_errors, &full_name));
            }
            ValidationErrorsKind::List(list_errors) => {
                for (index, nested_errors) in list_errors {
                    let list_prefix = format!("{}[{}]", full_name, index);
                    messages.extend(flatten_validation_errors(nested_errors, &list_prefix));
                }
            }
        }
    }
    messages
}
