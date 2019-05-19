class Api::MovementsController < Api::ApiApplicationController
    before_action :set_user_report, only: [:index, :create]
    before_action :set_movement, only: [:show, :update, :destroy]

    def index
        @movements = @user_report.movements.order(:operation_date).all
        
        @movements = @movements.where(["operation_date >= :date_from", {:date_from => params[:date_from]}]).all if(params[:date_from])
        @movements = @movements.where(["operation_date <= :date_to", {:date_to => params[:date_to]}]).all if(params[:date_to])

        render json: @movements.as_json
    end
    
    def show
        render json: @movement.as_json
    end

    def create
        movement = @user_report.movements.new(movement_params)
        if movement.save
            render json: movement.as_json
        else
            render json: {error: movement.errors, status: :unprocessable_entity}
        end
    end

    def update
        if @movement.update_attributes(movement_params)
            render json: @movement.as_json
        else
            render json: {error: @movement.errors, status: :unprocessable_entity}
        end
    end

    def destroy
        @movement.destroy
        head :no_content
    end

    private
    def movement_params
        params.require(:movement)
        .permit(
            :name, 
            :user_report_id, 
            :description,
            :movement_type, 
            :amount,
            :operation_date)
    end

    def set_user_report
        @user_report = UserReport.find(params[:user_report_id])
    end

    def set_movement
        @movement = PeriodicalMovement.find(params[:id])
    end
end
