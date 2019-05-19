class ModalWindow extends React.Component {
    render(){
        var header = '';
        if(this.props.title) {
            var modal_id = this.props.modal_id
            header = (
<div className="modal-header">
    <button type="button" className="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button>
    <h4 className="modal-title" id={modal_id+"Label"}>{this.props.title}</h4>
</div>
        
            );
        }

        var buttons = [];
        buttons.push(<button type="button" key="close" className="btn btn-default" data-dismiss="modal">Close</button>)
        if(this.props.buttons) {
            this.props.buttons.forEach(button => {
                buttons.push(button);
            });
        }

        return(
<div className="modal" id={modal_id} tabIndex="-1" role="dialog" aria-labelledby={modal_id+"Label"}>
  <div className="modal-dialog" role="document">
    <div className="modal-content">
        {header}
      <div className="modal-body">
        {this.props.modal_body}
      </div>
      <div className="modal-footer">
        {buttons}
      </div>
    </div>
  </div>
</div>
        );
    }
}