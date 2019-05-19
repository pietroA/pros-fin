class Movement extends React.Component{
    render(){
        var description = '';
        if(this.props.movement.description){
            description = <p>{this.props.movement.description}</p>;
        }
        return(
<div className={"movement "+this.props.movement.movement_type == 1 ? 'accredito' : 'addebito'}>
    <h4>{this.props.movement.operation_date} - {this.props.movement.name}</h4>
    <h3>{this.props.movement.amount}</h3>
    {description}
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
            description: ''
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
                description: this.props.movement.description
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
        movement.name = this.state.operation_date;
        movement.description = this.state.description;

        $.ajax({
            url: '/api/user_reports/'+this.props.user_report.id+'/movements/',
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
        if(this.props.movement){
            legend = "Modifica " + this.state.name;
        }
        return(
<form>
    <fieldset>
        <legend>{legend}</legend>
        <div className="field">
            <label htmlFor="name">Nome</label>
            <input type="text" name="name" value={this.state.name} onChange={this.HandleChange} />
        </div>
        <div className="field">
            <textarea name="description" onChange={this.HandleChange} value={this.state.description}></textarea>
        </div>

        <div className="field">
            <label htmlFor="movement_type">Movimento di: </label>
            <select name="movement_type"
                    value={this.state.movement_type}
                    onChange={this.HandleChange}>
                    <option value="0">Tipo Movimento</option>
                    <option value="1">Accredito</option>
                    <option value="2">Addebito</option>
            </select>
        </div>

        <div className="field">
            <label htmlFor="amount">Importo</label>
            <input type="number" name="amount" value={this.state.amount} min="0.00" onChange={this.HandleChange} />
        </div>
        <div className="field">
            <label htmlFor="operation_date">Data Operazione</label>
            <input type="date" name="operation_date" value={this.state.operation_date} onChange={this.HandleChange} />
        </div>
    </fieldset>

    <button type="button" onClick={this.Save}> <i className="fa fa-save"></i> Salva</button>
    <button type="reset"><i className="fa fa-undo"></i> Annulla</button>
</form>
        );
    }
}