class Movement extends React.Component{
    constructor(props){
        super(props);
        this.state = {
            edit_mode : false
        };
        this.EditModal = this.EditModal.bind(this);
        this.Delete = this.Delete.bind(this);
        this.DeleteModal = this.DeleteModal.bind(this);
    }
    EditModal(e){
        e.preventDefault();
        $("#edit-movement-"+this.props.movement.id).modal("show");
    }
    DeleteModal(e) {
        e.preventDefault();
        $("#delete-movement-"+this.props.movement.id).modal("show");
    }
    Delete() {
        $.ajax({
            url: '/api/user_reports/'+this.props.user_report.id+'/movements/'+this.props.movement.id,
            type : 'DELETE',
            success : () => { 
                $("#delete-movement-"+this.props.movement.id).modal("hide");
                this.props.Reload();
             },
            error : (xhr, error, status) => { console.log(xhr, error, status); }
        });
    }
    render(){

        var movement_type = this.props.movement.movement_type == 1 ? 'accredito' : 'addebito';

        var description = '';
        if(this.props.movement.description){
            description = <p>{this.props.movement.description}</p>;
        }

        var content = <div>
            <h4>{this.props.movement.operation_date} - {this.props.movement.name}</h4>
            {description}
            <ul className="list-group">
                <li className="list-group-item">
                    <b>Importo:</b> {this.props.movement.amount}
                </li>
                <li  className="list-group-item">
                    <b>Tipo Movimento:</b> {movement_type}
                </li>
            </ul>
        </div>;

    return(
<div className={"movement "+movement_type}>
    <nav>
        <a href="" onClick={this.EditModal} className="edit-button">
            <i className="fa fa-pencil"></i>
        </a>
        <a href="" onClick={this.DeleteModal} className="delete-button">
            <i className="fa fa-trash"></i>
        </a>
    </nav>
    <div className="content">
        {content}
    </div>
    <div className="modal fade" tabIndex="-1" role="dialog" id={"delete-movement-"+this.props.movement.id}>
        <div className="modal-dialog" role="document">
            <div className="modal-content">
                <div className="modal-header">
                    <button type="button" className="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button>
                    <h4 className="modal-title">Conferma</h4>
                </div>
                <div className="modal-body">
                    <p>Sei sicuro di eliminare il movimento {this.props.movement.name}?</p>
                    <p><small>Verrà eliminato il solo movimento</small></p>
                </div>
                <div className="modal-footer">
                    <button type="button" className="btn btn-default" data-dismiss="modal">Close</button>
                    <button type="button" className="btn btn-primary" onClick={this.Delete}>Elimina</button>
                </div>
            </div>
        </div>
    </div>
    <div className="modal fade" tabIndex="-1" role="dialog" id={"edit-movement-"+this.props.movement.id}>
        <div className="modal-dialog" role="document">
            <div className="modal-content">
                <div className="modal-header">
                    <button type="button" className="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button>
                    <h4 className="modal-title">Modifica movimento {this.props.movement.name}</h4>
                </div>
                <div className="modal-body">
                    <MovementForm user_report={this.props.user_report}
                                 movement={this.props.movement}
                                 Reload={this.props.Reload} />
                </div>
            </div>
        </div>
    </div>
</div>
        )
    }
}

class MovementForm extends React.Component{
    constructor(props){
        super(props);
        this.state = {
            movement_type: 0,
            amount: 0.00,
            operation_date: new Date(),
            name: '',
            description: '',
            edited: false
        };
        this.Save = this.Save.bind(this);
        this.Post = this.Post.bind(this);
        this.Put = this.Put.bind(this);
        this.HandleChange = this.HandleChange.bind(this);
    }
    componentDidMount(){
        if(this.props.movement){
            this.setState({
                movement_type: this.props.movement.movement_type,
                amount: this.props.movement.amount,
                operation_date: this.props.movement.operation_date,
                name: this.props.movement.name,
                description: this.props.movement.description,
                edited: this.props.movement.edited
            });
        }
    }
    Save(){
        if(this.props.movement){
            this.Put();
        } else {
            this.Post();
        }
    }
    Post(){
        var movement = this.state;
        $.ajax({
            url: '/api/user_reports/'+this.props.user_report.id+'/movements/',
            type: 'POST',
            data: {
                movement : movement
            },
            success: (movement) => { 
                this.props.Reload();
                this.setState({
                    movement_type: 0,
                    amount: 0.00,
                    operation_date: new Date(),
                    name: '',
                    description: ''
                });
            },
            error: (xhr, error, status) => { console.log(xhr, error, status); }
        });
    }
    Put(){
        var movement = this.props.movement;
        movement.movement_type = this.state.movement_type;
        movement.amount = this.state.amount;
        movement.operation_date = this.state.operation_date;
        movement.name = this.state.name;
        movement.description = this.state.description;

        $.ajax({
            url: '/api/user_reports/'+this.props.user_report.id+'/movements/'+movement.id,
            type: 'PUT',
            data: {
                movement : movement
            },
            success: (movement) => { 
                this.props.Reload();
            },
            error: (xhr, error, status) => { console.log(xhr, error, status); }
        });
    }
    HandleChange(e){
        var name = e.target.name;
        var value = e.target.value;
        this.setState({[name] : value});
    }
    render(){
        var legend = "Nuovo Movimento";
        var edited = "";
        if(this.props.movement){
            legend = "Modifica " + this.state.name;
            if(this.props.movement.periodical_movement_id) {
                edited = (
                    <div className="field checkbox">
                        <label htmlFor="edited">
                            <input type="checkbox" value={this.state.edited} onChange={this.HandleChange} /> Blocca le modifiche 
                            <i  className="fa fa-info-circle" 
                                data-toggle="tooltip" 
                                data-placement="bottom" 
                                title="In caso venisse modificato il movimento periodico questo movimento non verrà modificato"></i>
                        </label>
                        
                    </div>
                );
            }
        }
        return(
<form>
    <fieldset>
        <legend>{legend}</legend>
        <div className="form-group">
            <label htmlFor="name">Nome</label>
            <input className="form-control" type="text" name="name" value={this.state.name} onChange={this.HandleChange} />
        </div>
        <div className="form-group">
            <textarea  className="form-control" name="description" onChange={this.HandleChange} value={this.state.description}></textarea>
        </div>

        <div className="form-group">
            <label htmlFor="movement_type">Movimento di: </label>
            <select name="movement_type"
                     className="form-control"
                    value={this.state.movement_type}
                    onChange={this.HandleChange}>
                    <option value="0">Tipo Movimento</option>
                    <option value="1">Accredito</option>
                    <option value="2">Addebito</option>
            </select>
        </div>

        <div className="form-group">
            <label htmlFor="amount">Importo</label>
            <input  className="form-control" type="number" name="amount" value={this.state.amount} min="0.00" onChange={this.HandleChange} />
        </div>
        <div className="form-group">
            <label htmlFor="operation_date">Data Operazione</label>
            <input  className="form-control" type="date" name="operation_date" value={this.state.operation_date} onChange={this.HandleChange} />
        </div>
    </fieldset>

    <button className="btn btn-default" type="button" onClick={this.Save}> <i className="fa fa-save"></i> Salva</button>
    <button className="btn btn-default" type="reset"><i className="fa fa-undo"></i> Annulla</button>
</form>
        );
    }
}