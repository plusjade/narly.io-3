class ApplicationController < ActionController::Base
  protect_from_forgery

  rescue_from Rugged::RepositoryError, Rugged::OSError do |exception|
    render(text: "invalid repository", status: :unauthorized)
  end
end
