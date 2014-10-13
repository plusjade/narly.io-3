class CoursesController < ApplicationController
  def index
    @courses = Course.all
  end

  def show
    @repo = Repo.new("#{ params[:username] }/#{ params[:id] }")
  end

  def steps
    repo = Repo.new("#{ params[:username] }/#{ params[:id] }")
    step = repo.step(params[:step_id])

    respond_to do |format|
      format.json do
        render json: { step: step.payload }
      end
    end
  end
end
