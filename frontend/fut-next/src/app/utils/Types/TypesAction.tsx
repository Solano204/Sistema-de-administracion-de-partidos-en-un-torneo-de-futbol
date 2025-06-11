export type actionFunctionAsync = (
  prevState: any,
  formData: FormData
) => Promise<{  message: string,success:boolean}>;

export type actionFunctionSync = (
  state: { message: string },
  formData: FormData
) => { message: string,success:boolean};



export const isActionFunctionAsync  = (
  state: { message: string },
  formData: FormData
) => { 
  return { message: "json" };
}