class AddColumnsToMovements < ActiveRecord::Migration[5.1]
  def change
    add_reference :movements, :periodical_movement, foreign_key: true
  end
end
