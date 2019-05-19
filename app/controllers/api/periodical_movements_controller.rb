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
            p @periodical_movement
            generate_movements @periodical_movement.start_date
            render json: @periodical_movement.as_json
        else
            render json: {error: @periodical_movement.errors, status: :unprocessable_entity}
        end
    end

    def update
        if @periodical_movement.update_attributes(periodical_movement_params)
            set_movements
            render json: @periodical_movement.as_json
        else
            render json: {error: @periodical_movement.errors, status: :unprocessable_entity}
        end
    end

    def destroy
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

    def generate_movements start_date
        weekly = @periodical_movement.type_repetition == 1
        monthly = @periodical_movement.type_repetition == 2
        end_month = @periodical_movement.type_repetition == 3
        repetition_value = @periodical_movement.value_repetition

        p @periodical_movement
        p weekly
        p monthly
        p end_month

        start_date.upto @periodical_movement.end_date do |d|
            p d
            if((weekly && d.wday == repetition_value) || (monthly && d.mday == repetition_value) || (end_month && d.month == d.nextday.month))
                unless @periodical_movement.movements.find_by(operation_date: d)
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
            end
        end
    end

    def set_movements
        start_date = Date.today
        start_date = @periodical_movement.start_date if params[:previous]

        movements = 
        if params[:all] 
            @periodical_movement.movements.where(["operation_date >= :today", {:today => start_date}]).all                
        else
            @periodical_movement.movements.where(["operation_date >= :today and edited = false", {:today => start_date}]).all                
        end

        movements.each {|m| m.destroy}

        generate_movements start_date
    end
end
