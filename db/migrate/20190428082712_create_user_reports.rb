class CreateUserReports < ActiveRecord::Migration[5.1]
  def change
    create_table :user_reports do |t|
      t.string :name
      t.references :user, foreign_key: true

      t.timestamps
    end
  end
end
