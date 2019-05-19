class PeriodicalMovement extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            edit_mode : false
        };
        this.ToggleMode = this.ToggleMode.bind(this);
    }
    ToggleMode(e) {
        e.preventDefault();
        var edit_mode = !this.state.edit_mode;
        this.setState({ edit_mode : edit_mode });
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
            <b>Da:</b> { this.props.periodical_movement.start_date } <b>A:</b> { this.props.periodical_movement.end_date }
        </li>
        <li className="list-group-item">
            <b>Si ripete:</b> <Repetition repetition_type={this.props.periodical_movement.type_repetition} 
                                          repetition_value={this.props.periodical_movement.value_repetition} />

        </li>
    </ul>
</div>;
        if(this.state.edit_mode) {
            content = <PeriodicalMovementForm user_report={this.props.user_report}
                                              periodical_movement={this.props.periodical_movement}
                                              Reload={this.props.Reload} />;
        }

        return(
<div className={"movement "+tipo_movimento}>
    <a href="" onClick={this.ToggleMode} className="edit-button">
        <i className="fa fa-pencil"></i>
    </a>
    {content}
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
            all: false
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
        $.ajax({
            url: '/api/user_reports/'+this.props.user_report.id+'/periodical_movements/',
            type: 'POST',
            data: {
                periodical_movement : this.state
            },
            success: (periodical_movement) => { this.props.Reload(); },
            error: (xhr, errors, status) => { console.log(xhr, errors, status); }
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
                periodical_movement : periodical_movement
            },
            success: (periodical_movement) => { this.props.Reload(); },
            error: (xhr, errors, status) => { console.log(xhr, errors, status); }
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
    <div className="field">
        <label htmlFor="previous">Includi precendenti</label>
        <input type="checkbox" id="previous" name="previous" value={this.state.previous} onChange={this.HandleChange} />
    </div>
    <div className="field">
        <label htmlFor="all">Includi precendenti</label>
        <input type="checkbox" id="all" name="all" value={this.state.all} onChange={this.HandleChange} />
    </div>
</div>
            );
        }

        return(
<form>
    <fieldset>
        <legend>{title}</legend>
        <div className="field">
            <label htmlFor="name">Nome</label>
            <input type="text" name="name" id="name" value={this.state.name} onChange={this.HandleChange} />
        </div>
        <div className="field">
            <label htmlFor="movement_type">Accredito/Addebito</label>
            <select name="movement_type" id="movement_type" value={this.state.movement_type} onChange={this.HandleChange}>
                <option value="0"> -- seleziona -- </option>
                <option value="1"> Accredito </option>
                <option value="2"> Addebito </option>
            </select>
        </div>
        <div className="field">
            <label htmlFor="type_repetition">Tipo di ripetizione</label>
            <select name="type_repetition" id="type_repetition" value={this.state.type_repetition} onChange={this.HandleChange}>
                <option value="0"> -- seleziona -- </option>
                <option value="1"> Giorno della settimana </option>
                <option value="2"> Giorno del mese </option>
                <option value="3"> Ultimo del mese </option>
            </select>
        </div>
        <div className="field">
            <label htmlFor="value_repetition">Giorno della ripetizione</label>
            <input type="number" name="value_repetition" id="value_repetition" value={this.state.value_repetition} onChange={this.HandleChange} />
        </div>
        <Repetition repetition_type={this.state.type_repetition} repetition_value={this.state.value_repetition} />
        <div className="field">
            <label htmlFor="amount">Importo</label>
            <input type="number" min="0,00" name="amount" id="amount" value={this.state.amount} onChange={this.HandleChange} />
        </div>
        <div className="field">
            <label htmlFor="start_date">Da</label>
            <input type="date" name="start_date" id="start_date" value={this.state.start_date} onChange={this.HandleChange} />
            <label htmlFor="end_date">A</label>
            <input type="date" name="end_date" id="end_date" value={this.state.end_date} onChange={this.HandleChange} />
        </div>
        <div>
            <textarea name="description" id="description" value={this.state.description} onChange={this.HandleChange}></textarea>
        </div>
        {update_options}
    </fieldset>
    <button type="button" onClick={this.Save}><i className="fa fa-save"></i> Salva</button>
    <button type="reset"><i className="fa fa-undo"></i> Annulla</button>
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