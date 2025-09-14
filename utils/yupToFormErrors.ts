import isEmpty from 'is-empty'
import { ValidationError } from 'yup'

type FormErrors = Record<string, string>

export default function yupToFormError(validationError: ValidationError | null | undefined): FormErrors {
    if (isEmpty(validationError) || !validationError?.inner) {
        return {}
    }

    const errors = validationError.inner.reduce<FormErrors>((accessor, error) => {
        if (error.path) {
            accessor[error.path] = error.message
        }
        return accessor
    }, {})

    return errors
}
