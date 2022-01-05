import { Form, Formik, useField } from 'formik';
import React, { InputHTMLAttributes } from 'react'

type InputFieldProps = InputHTMLAttributes<HTMLInputElement> & {
    name: string;
    placeholder: string;
    label: string;
    textarea: boolean;
};// object makes attribute required

export const InputField: React.FC<InputFieldProps> = (props) => {
    const [field, { error, }] = useField(props);
    return (
        <div className="flex flex-col space-y-1 align-center">
            <label htmlFor={field.name}>{props.label}</label>
            {props.textarea ? <textarea className={!!error ? "bg-slate-200 p-2 rounded-lg border-red-400 border-[1px]" : "bg-slate-200 p-2 rounded-lg"} placeholder={props.placeholder} {...field} id={field.name} rows={4} cols={40} ></textarea>
                : <input className={!!error ? "bg-slate-200 p-2 rounded-lg border-red-400 border-[1px]" : "bg-slate-200 p-2 rounded-lg"} placeholder={props.placeholder} type={props.type} {...field} id={field.name} />
            }
            {!!error ? <p className='text-xs text-red-400 mt-0'>{error}</p> : null}
        </div>
    );
}