class CoursesController < ApplicationController
  def show
    @repo = Repo.new(params[:id])
  end
end
