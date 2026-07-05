export type ActionStatus = "idle" | "success" | "error";

export type FormFieldErrors = Record<string, string[] | undefined>;

export type FormActionState = {
  status: ActionStatus;
  message: string;
  fieldErrors?: FormFieldErrors;
};

export const initialFormActionState: FormActionState = {
  status: "idle",
  message: "",
};

export function getFirstFieldError(state: FormActionState, fieldName: string): string | undefined {
  return state.fieldErrors?.[fieldName]?.[0];
}

export function toErrorState(message: string, fieldErrors?: FormFieldErrors): FormActionState {
  return {
    status: "error",
    message,
    fieldErrors,
  };
}

export function toSuccessState(message: string): FormActionState {
  return {
    status: "success",
    message,
  };
}
