export default function Input({label, ...restprops}){
    return <>
    <label>{label}</label>
    <input {...restprops}/>
</>
}