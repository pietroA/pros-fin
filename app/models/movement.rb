class Movement < ApplicationRecord
  belongs_to :user_report
  belongs_to :periodical_movement, optional: true
end
