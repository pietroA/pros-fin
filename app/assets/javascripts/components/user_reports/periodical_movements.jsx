class PeriodicalMovement extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            edit_mode : false,
            delete_option: 0
        };
        this.ToggleMode = this.ToggleMode.bind(this);
        this.HandleChange = this.HandleChange.bind(this);
        this.EditModal = this.EditModal.bind(this);
        this.Delete = this.Delete.bind(this);
        this.DeleteModal = this.DeleteModal.bind(this);
    }
    HandleChange(e){
        var name = e.target.name;
        var value = e.target.value;
        this.setState({ [name] : value });
    }
    ToggleMode(e) {
        e.preventDefault();
        var edit_mode = !this.state.edit_mode;
        this.setState({ edit_mode : edit_mode });
    }
    EditModal(e){
        e.preventDefault();
        $("#edit-pm-"+this.props.periodical_movement.id).modal("show");
    }
    DeleteModal(e) {
        e.preventDefault();
        $("#delete-pm-"+this.props.periodical_movement.id).modal("show");
    }
    Delete() {
        $.ajax({
            url: '/api/user_reports/'+this.props.user_report.id+'/periodical_movements/'+this.props.periodical_movement.id,
            type : 'DELETE',
            data : {
                delete_option : this.state.delete_option
            },
            success : () => { 
                $("#delete-pm-"+this.props.periodical_movement.id).modal("hide");
                this.props.Reload(); 
            },
            error : (xhr, error, status) => { console.log(xhr, error, status); }
        });
    }
    render(){

        var tipo_movimento = this.props.periodical_movement.movement_type == 1 ? 'accredito' : 'addebito';

        var description = '';
        if(this.props.periodical_movement.description){
            description = <p>{this.props.periodical_movement.description}</p>
        }

        var content = <div>
    <h4>{this.props.periodical_movement.name}</h4>
    {description}
    <ul className="list-group">
        <li className="list-group-item">
            <b>Tipo Movimento:</b> { tipo_movimento }
        </li>
        <li className="list-group-item">
            <b>Importo:</b> { this.props.periodical_movement.amount }
        </li>
        <li className="list-group-item">
            <b>Da:</b> { this.props.periodical_movement.start_date }
        </li>
        <li className="list-group-item">
            <b>A:</b> { this.props.periodical_movement.end_date }
        </li>
        <li className="list-group-item">
            <b>Si ripete:</b> <Repetition repetition_type={this.props.periodical_movement.type_repetition} 
                                          repetition_value={this.props.periodical_movement.value_repetition} />

        </li>
    </ul>
</div>;

        return(
<div className={"movement "+tipo_movimento}>
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
    <div className="modal fade" tabIndex="-1" role="dialog" id={"delete-pm-"+this.props.periodical_movement.id}>
        <div className="modal-dialog" role="document">
            <div className="modal-content">
                <div className="modal-header">
                    <button type="button" className="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button>
                    <h4 className="modal-title">Conferma</h4>
                </div>
                <div className="modal-body">
                    <p>Sei sicuro di eliminare il movimento periodico {this.props.periodical_movement.name}?</p>
                    <p><small>Verrà eliminato il solo movimento</small></p>
                    <select name="delete_option" value={this.state.delete_option} onChange={this.HandleChange}>
                        <option value="0">Non eliminare i movimenti</option>
                        <option value="1">Elimina tutti i movimenti</option>
                        <option value="2">Elimina tutti i movimenti tranne quelli modificati</option>
                        <option value="3">Elimina solo i movimenti futuri</option>
                        <option value="4">Elimina solo i movimenti futuri tranne quelli modificati</option>
                        <option value="5">Elimina solo i movimenti passati</option>
                        <option value="6">Elimina solo i movimenti passati tranne quelli modificati</option>
                    </select>
                </div>
                <div className="modal-footer">
                    <button type="button" className="btn btn-default" data-dismiss="modal">Close</button>
                    <button type="button" className="btn btn-primary" onClick={this.Delete}>Elimina</button>
                </div>
            </div>
        </div>
    </div>
    <div className="modal fade" tabIndex="-1" role="dialog" id={"edit-pm-"+this.props.periodical_movement.id}>
        <div className="modal-dialog" role="document">
            <div className="modal-content">
                <div className="modal-header">
                    <button type="button" className="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button>
                    <h4 className="modal-title">Modifica movimento {this.props.periodical_movement.name}</h4>
                </div>
                <div className="modal-body">
                <PeriodicalMovementForm user_report={this.props.user_report}
                                              periodical_movement={this.props.periodical_movement}
                                              Reload={this.props.Reload} />
                </div>
            </div>
        </div>
    </div>
</div>
        )
    }
}

class PeriodicalMovementForm extends React.Component {
    constructor(props){
        super(props);
        this.state = {
            name : '',
            description : '',
            movement_type : 0,
            amount : 0,
            type_repetition : 0,
            value_repetition : 0,
            start_date : new Date(),
            end_date : new Date(),
            previous: false,
            all: false,
            operation_result : ''
        };
        this.Save = this.Save.bind(this);
        this.Add  = this.Add.bind(this);
        this.Update = this.Update.bind(this);
        this.HandleChange = this.HandleChange.bind(this);
    }
    componentDidMount(){
        if(this.props.periodical_movement){
            this.setState({
                name : this.props.periodical_movement.name,
                description : this.props.periodical_movement.description,
                movement_type : this.props.periodical_movement.movement_type,
                amount : this.props.periodical_movement.amount,
                type_repetition : this.props.periodical_movement.type_repetition,
                value_repetition : this.props.periodical_movement.value_repetition,
                start_date : this.props.periodical_movement.start_date,
                end_date : this.props.periodical_movement.end_date
                });
        }
    }
    Save(){
        if(this.props.periodical_movement){
            this.Update();
        } else {
            this.Add();
        }
    }
    Add(){
        var periodical_movement = {};
        periodical_movement.name = this.state.name;
        periodical_movement.description = this.state.description;
        periodical_movement.movement_type = this.state.movement_type;
        periodical_movement.type_repetition = this.state.type_repetition;
        periodical_movement.value_repetition = this.state.value_repetition;
        periodical_movement.amount = this.state.amount;
        periodical_movement.start_date = this.state.start_date;
        periodical_movement.end_date = this.state.end_date;

        $.ajax({
            url: '/api/user_reports/'+this.props.user_report.id+'/periodical_movements/',
            type: 'POST',
            data: {
                periodical_movement : periodical_movement
            },
            success: (periodical_movement) => {
                 this.setState({operation_result:"Movimento Periodico inserito correttamente"});
                 this.props.Reload(); 
                },
            error: (xhr, errors, status) => { 
                this.setState({operation_result:"Errore riscontrato: "+errors});
                console.log(xhr, errors, status); 
            }
        });
    }
    Update(){
        var periodical_movement = this.props.periodical_movement;
        periodical_movement.name = this.state.name;
        periodical_movement.description = this.state.description;
        periodical_movement.movement_type = this.state.movement_type;
        periodical_movement.type_repetition = this.state.type_repetition;
        periodical_movement.value_repetition = this.state.value_repetition;
        periodical_movement.amount = this.state.amount;
        periodical_movement.start_date = this.state.start_date;
        periodical_movement.end_date = this.state.end_date;

        $.ajax({
            url: '/api/user_reports/'+this.props.user_report.id+'/periodical_movements/'+periodical_movement.id,
            type: 'PUT',
            data: {
                periodical_movement : periodical_movement,
                previous : this.state.previous,
                all : this.state.all
            },
            success: (_periodical_movement) => { 
                this.setState({operation_result:"Aggiornamento effettuato"});
                this.props.Reload(); 
            },
            error: (xhr, errors, status) => { 
                this.setState({operation_result:"Errore riscontrato: "+errors});
                console.log(xhr, errors, status); 
            }
        });
    }
    HandleChange(e){
        var name = e.target.name;
        var value = e.target.value;

        this.setState({[name] : value});
    }
    render(){
        var title = "Nuovo Movimento Periodico";

        var update_options = "";

        if(this.props.periodical_movement) {
            title = this.props.periodical_movement.name;
            update_options = (
<div>
    <div className="field checkbox">
        <label htmlFor="previous">
            Includi precendenti <input type="checkbox" id="previous" name="previous" value={this.state.previous} onChange={this.HandleChange} />
        </label>
    </div>
    <div className="field checkbox">
        <label htmlFor="all">
            Includi modificati <input type="checkbox" id="all" name="all" value={this.state.all} onChange={this.HandleChange} />
        </label>        
    </div>
</div>
            );
        }

        
        return(
<form>
    <p>{this.state.operation_result}</p>
    <fieldset>
        <legend>{title}</legend>
        <div className="form-group">
            <label htmlFor="name">Nome</label>
            <input className="form-control" type="text" name="name" id="name" value={this.state.name} onChange={this.HandleChange} />
        </div>
        <div className="form-group">
            <label htmlFor="movement_type">Accredito/Addebito</label>
            <select className="form-control" name="movement_type" id="movement_type" value={this.state.movement_type} onChange={this.HandleChange}>
                <option value="0"> -- seleziona -- </option>
                <option value="1"> Accredito </option>
                <option value="2"> Addebito </option>
            </select>
        </div>
        <div className="form-group">
            <label htmlFor="type_repetition">Tipo di ripetizione</label>
            <select name="type_repetition" id="type_repetition" value={this.state.type_repetition} onChange={this.HandleChange}>
                <option value="0"> -- seleziona -- </option>
                <option value="1"> Giorno della settimana </option>
                <option value="2"> Giorno del mese </option>
                <option value="3"> Ultimo del mese </option>
            </select>
        </div>
        <div className="form-group">
            <label htmlFor="value_repetition">Giorno della ripetizione</label>
            <input className="form-control" type="number" name="value_repetition" id="value_repetition" value={this.state.value_repetition} onChange={this.HandleChange} />
        </div>
        <Repetition repetition_type={this.state.type_repetition} repetition_value={this.state.value_repetition} />
        <div className="form-group">
            <label htmlFor="amount">Importo</label>
            <input className="form-control" type="number" min="0,00" name="amount" id="amount" value={this.state.amount} onChange={this.HandleChange} />
        </div>
        <div className="form-group">
            <label htmlFor="start_date">Da</label>
            <input className="form-control" type="date" name="start_date" id="start_date" value={this.state.start_date} onChange={this.HandleChange} />
            <label htmlFor="end_date">A</label>
            <input className="form-control" type="date" name="end_date" id="end_date" value={this.state.end_date} onChange={this.HandleChange} />
        </div>
        <div>
            <textarea className="form-control" name="description" id="description" value={this.state.description} onChange={this.HandleChange}></textarea>
        </div>
        {update_options}
    </fieldset>
    <p>{this.state.operation_result}</p>
    <button className="btn btn-button" type="button" onClick={this.Save}><i className="fa fa-save"></i> Salva</button>
    <button className="btn btn-button" type="reset"><i className="fa fa-undo"></i> Annulla</button>
</form>
        );
    }
}

class Repetition extends React.Component{
    render(){
        var settimana = ['lunedì', 'martedì', 'mercoledì', 'giovedì', 'venderdì', 'sabato', 'domenica'];
        var ripetizione = 'selezione la modalità di ripetizione';

        if(this.props.repetition_type == 1 && this.props.repetition_value) {
            ripetizione = 'Ogni '+settimana[this.props.repetition_value - 1]
        }

        if(this.props.repetition_type == 2 && this.props.repetition_value) {
            ripetizione = 'Ogni '+this.props.repetition_value + '° giorno del mese';
        }

        if(this.props.repetition_type == 3) {
            ripetizione = 'ultimo giorno del mese';
        }

        return(
            <span>{ripetizione}</span>
        );
    }
}