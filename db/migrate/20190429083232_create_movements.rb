class CreateMovements < ActiveRecord::Migration[5.1]
  def change
    create_table :movements do |t|
      t.references :user_report, foreign_key: true
      t.integer :movement_type
      t.decimal :amount
      t.date :operation_date
      t.string :name
      t.text :description

      t.timestamps
    end
  end
end
