const ReportActionItemComponent = (props: { text: string; score: number }) => {
  return (
    <div>
      <h1>Score: {props.score}</h1>
      <h3>Text: {props.text}</h3>
    </div>
  );
};

export default ReportActionItemComponent;
