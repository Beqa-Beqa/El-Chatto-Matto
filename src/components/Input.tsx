const Input = (props: {value:string, type: string, placeholder: string}) => {
  return (
    <input className="input" type={props.type} placeholder={props.placeholder} />
  );
}

export default Input;