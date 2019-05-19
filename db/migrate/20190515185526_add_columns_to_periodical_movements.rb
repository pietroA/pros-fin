class AddColumnsToPeriodicalMovements < ActiveRecord::Migration[5.1]
  def change
    add_column :periodical_movements, :start_date, :date
    add_column :periodical_movements, :end_date, :date
  end
end
