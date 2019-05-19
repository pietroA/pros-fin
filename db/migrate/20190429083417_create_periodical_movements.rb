class CreatePeriodicalMovements < ActiveRecord::Migration[5.1]
  def change
    create_table :periodical_movements do |t|
      t.references :user_report, foreign_key: true
      t.integer :movement_type
      t.decimal :amount
      t.string :name
      t.text :description
      t.integer :value_repetition
      t.integer :type_repetition

      t.timestamps
    end
  end
end
