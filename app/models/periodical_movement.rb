class PeriodicalMovement < ApplicationRecord
  belongs_to :user_report
  has_many :movements, dependent: :destroy
end
