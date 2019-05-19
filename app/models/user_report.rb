class UserReport < ApplicationRecord
  belongs_to :user
  has_many :movements, dependent: :destroy
  has_many :periodical_movements, dependent: :destroy

  validates :name,
    presence: true
  
  def as_json(options = {})
    super(options.merge(include: [:user, :movements, :periodical_movements]))
  end
end
