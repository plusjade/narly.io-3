class ApplicationController < ActionController::Base
  protect_from_forgery

  rescue_from Rugged::RepositoryError do |exception|
    render(text: "invalid repository", status: :unauthorized)
  end
end
