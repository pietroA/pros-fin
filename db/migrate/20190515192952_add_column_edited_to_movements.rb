class AddColumnEditedToMovements < ActiveRecord::Migration[5.1]
  def change
    add_column :movements, :edited, :bool
  end
end
