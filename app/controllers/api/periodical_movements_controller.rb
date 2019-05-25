class Api::PeriodicalMovementsController < Api::ApiApplicationController
    before_action :set_user_report, only: [:index, :create, :update]
    before_action :set_periodical_movement, only: [:show, :update, :destroy]

    def index
        render json: @user_report.periodical_movements.as_json
    end
    
    def show
        render json: @periodical_movement.as_json
    end

    def create
        @periodical_movement = @user_report.periodical_movements.new(periodical_movement_params)
        if @periodical_movement.save
            generate_movements @periodical_movement.start_date
            render json: @periodical_movement.as_json
        else
            render json: {error: @periodical_movement.errors, status: :unprocessable_entity}
        end
    end

    def update
        puts "update"
        if @periodical_movement.update_attributes(periodical_movement_params)
            start_date = Date.today
            start_date = @periodical_movement.start_date if params[:previous]

            generate_movements start_date, true
            
            render json: @periodical_movement.as_json
        else
            render json: {error: @periodical_movement.errors, status: :unprocessable_entity}
        end
    end

    def destroy
        if params[:delete_option] == '0'
            @periodical_movement.movements.all.each { |m| m.update_attributes(periodical_movement: nil) }
        elsif params[:delete_option] == '2'
            @periodical_movement.movements.where(edited: true).all.each { |m| m.update_attributes(periodical_movement: nil) }
        elsif params[:delete_option] == '3'
            @periodical_movement.movements.where(['date_operation < :today', { :today => Date.today }]).all.each { |m| m.update_attributes(periodical_movement: nil) }
        elsif params[:delete_option] == '4'
            @periodical_movement.movements.where(['edited = true or date_operation < :today', { :today => Date.today }]).all.each { |m| m.update_attributes(periodical_movement: nil) }
        elsif params[:delete_option] == '5'
            @periodical_movement.movements.where(['date_operation > :today', { :today => Date.today }]).all.each { |m| m.update_attributes(periodical_movement: nil) }
        elsif params[:delete_option] == '6'
            @periodical_movement.movements.where(['edited = true or date_operation > :today', { :today => Date.today }]).all.each { |m| m.update_attributes(periodical_movement: nil) }
        end
        @periodical_movement.destroy
        head :no_content
    end

    private
    def periodical_movement_params
        params.require(:periodical_movement)
        .permit(
            :name, 
            :user_report_id, 
            :description,
            :movement_type, 
            :amount,
            :value_repetition,
            :type_repetition,
            :start_date,
            :end_date)
    end

    def set_user_report
        @user_report = UserReport.find(params[:user_report_id])
    end

    def set_periodical_movement
        @periodical_movement = PeriodicalMovement.find(params[:id])
    end

    def set_type
        @weekly = @periodical_movement.type_repetition == 1
        @monthly = @periodical_movement.type_repetition == 2
        @end_month = @periodical_movement.type_repetition == 3
        @repetition_value = @periodical_movement.value_repetition
    end

    def generate_movements start_date, update = false
        set_type
        start_date.upto @periodical_movement.end_date do |d|
            m = @periodical_movement.movements.find_by(operation_date: d)
            if((@weekly && d.wday == @repetition_value) || (@monthly && d.mday == @repetition_value) || (@end_month && d.month == d.nextday.month))
                if m
                    if update !m.edited || params[:all]
                        update_movement m, d
                    end
                else
                    insert_movement d
                end
            else
                m.destroy if m
            end
        end
    end

    def insert_movement d
        m = @user_report.movements.new
        m.periodical_movement = @periodical_movement
        m.name = @periodical_movement.name
        m.description = @periodical_movement.description
        m.amount = @periodical_movement.amount
        m.movement_type = @periodical_movement.movement_type
        m.operation_date = d
        m.edited = false

        m.save
        p m
    end

    def update_movement m, d
        m.periodical_movement = @periodical_movement
        m.name = @periodical_movement.name
        m.description = @periodical_movement.description
        m.amount = @periodical_movement.amount
        m.movement_type = @periodical_movement.movement_type
        m.operation_date = d
        m.edited = false

        m.save
        p m
    end
end