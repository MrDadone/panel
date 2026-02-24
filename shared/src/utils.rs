use validator::Validate;

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
        let mut errors = Vec::new();
        errors.reserve_exact(err.field_errors().len());

        for (field, field_errors) in err.field_errors() {
            for field_error in field_errors {
                if let Some(message) = &field_error.message {
                    errors.push(format!("{field}: {message}"));
                } else {
                    errors.push(format!("{field}: invalid {}", field_error.code));
                }
            }
        }

        return Err(errors);
    }

    Ok(())
}
