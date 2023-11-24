const TextBox = (props: {
  header: string,
  text: string
}) => {
  return(
    <div className="text-box text-center p-3 rounded h-100">
      <h2 className="gradient-text">{props.header}</h2>
      <p>{props.text}</p>
    </div>
  );
}

export default TextBox;