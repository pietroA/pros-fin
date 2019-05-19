class Api::UserReportsController < Api::ApiApplicationController
    before_action :set_user_report, only: [:show, :update, :destroy]

    def index
        render json: current_user.user_reports.as_json
    end
    
    def show
        render json: @user_report.as_json
    end

    def create
        user_report = current_user.user_reports.new(user_report_params)
        if user_report.save
            render json: user_report.as_json
        else
            render json: {error: user_report.errors, status: :unprocessable_entity}
        end
    end

    def update
        if @user_report.update_attributes(user_report_params)
            render json: @user_report.as_json
        else
            render json: {error: @user_report.errors, status: :unprocessable_entity}
        end
    end

    def destroy
        @user_report.destroy
        head :no_content
    end

    private
    def user_report_params
        params.require(:user_report).permit(:name, :user_id)
    end

    def set_user_report
        @user_report = UserReport.find(params[:id])
    end
end
